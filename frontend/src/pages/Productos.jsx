import { useState, useEffect } from 'react';
import api from '../services/api';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  // 1. Añadimos 'descripcion' al estado inicial
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', descripcion: '', categoria: '', precio: '', stock: ''
  });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get('productos/');
      setProductos(response.data);
    } catch (error) {
      mostrarMensaje('Error al cargar el inventario', 'danger');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`productos/${editandoId}/`, formData);
        mostrarMensaje('Producto actualizado exitosamente', 'success');
      } else {
        await api.post('productos/', formData);
        mostrarMensaje('Producto registrado exitosamente', 'success');
      }
      // Limpiamos el formulario incluyendo la descripción
      setFormData({ codigo: '', nombre: '', descripcion: '', categoria: '', precio: '', stock: '' });
      setEditandoId(null);
      fetchProductos();
    } catch (error) {
      mostrarMensaje('Error al guardar. Verifica que el código no esté repetido.', 'danger');
    }
  };

  const prepararEdicion = (producto) => {
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '', // Por si algún producto antiguo no tiene
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock
    });
    setEditandoId(producto.id);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar (inactivar) el producto ${nombre}?`)) {
      try {
        await api.patch(`productos/${id}/`, { estado: false });
        mostrarMensaje('Producto eliminado del catálogo exitosamente', 'success');
        fetchProductos();
      } catch (error) {
        mostrarMensaje('Error al eliminar el producto', 'danger');
      }
    }
  };

  return (
    <div className="container-fluid px-4">
      <h2 className="mb-4 fw-bold mt-3">Gestión de Inventario</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row">
        {/* FORMULARIO */}
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white fw-bold">
              {editandoId ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Código SKU *</label>
                  <input type="text" name="codigo" className="form-control" value={formData.codigo} onChange={handleInputChange} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Nombre del Producto *</label>
                  <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleInputChange} required />
                </div>

                {/* 2. Nuevo campo de Descripción */}
                <div className="mb-2">
                  <label className="form-label">Descripción</label>
                  <textarea name="descripcion" className="form-control" rows="2" value={formData.descripcion} onChange={handleInputChange} placeholder="Opcional..."></textarea>
                </div>

                <div className="mb-2">
                  <label className="form-label">Categoría *</label>
                  <input type="text" name="categoria" className="form-control" value={formData.categoria} onChange={handleInputChange} required />
                </div>
                <div className="row">
                  <div className="col-6 mb-2">
                    <label className="form-label">Precio ($) *</label>
                    <input type="number" name="precio" className="form-control" value={formData.precio} onChange={handleInputChange} required min="0" />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label">Stock *</label>
                    <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleInputChange} required min="0" />
                  </div>
                </div>
                <button type="submit" className={`btn w-100 fw-bold ${editandoId ? 'btn-warning' : 'btn-success'}`}>
                  {editandoId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
                {editandoId && (
                  <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => { setEditandoId(null); setFormData({ codigo: '', nombre: '', descripcion: '', categoria: '', precio: '', stock: '' }); }}>
                    Cancelar
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* TABLA DE LISTADO */}
        <div className="col-lg-9 col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      {/* 3. Nueva columna de Descripción (oculta en móviles para no romper diseño) */}
                      <th className="d-none d-lg-table-cell">Descripción</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock Físico</th>
                      <th>Stock Disp.</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.length === 0 ? (
                      <tr><td colSpan="8" className="text-center text-muted">No hay productos en inventario.</td></tr>
                    ) : (
                      productos.map((prod) => (
                        <tr key={prod.id}>
                          <td className="text-muted">{prod.codigo}</td>
                          <td className="fw-semibold">{prod.nombre}</td>

                          {/* 4. Celda de Descripción (truncada para no desbordar si es muy larga) */}
                          <td className="d-none d-lg-table-cell text-muted" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.descripcion || 'Sin descripción'}
                          </td>

                          <td><span className="badge bg-secondary">{prod.categoria}</span></td>
                          <td>${Number(prod.precio).toLocaleString()}</td>
                          <td className="text-center">{prod.stock}</td>
                          <td className="text-center fw-bold text-primary">{prod.stock_real}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => prepararEdicion(prod)}>Editar</button>
                            <button className="btn btn-sm btn-outline-danger mt-1 mt-xl-0" onClick={() => handleEliminar(prod.id, prod.nombre)}>Eliminar</button>
                            <button className="btn btn-sm btn-outline-success me-2" onClick={async () => {
                              const cant = window.prompt(`¿Cuántas unidades de ${prod.nombre} vas a ingresar?`);
                              if (cant && !isNaN(cant) && parseInt(cant) > 0) {
                                const motivo = window.prompt('Motivo del ingreso (Ej: Compra a proveedor):', 'Compra a proveedor');
                                try {
                                  await api.post(`productos/${prod.id}/abastecer/`, { cantidad: parseInt(cant), motivo });
                                  mostrarMensaje('Inventario actualizado (Entrada registrada)', 'success');
                                  fetchProductos();
                                } catch (e) {
                                  mostrarMensaje('Error al abastecer producto', 'danger');
                                }
                              }
                            }}>Abastecer</button>

                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productos;