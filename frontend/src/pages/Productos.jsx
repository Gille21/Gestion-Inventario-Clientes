import { useState, useEffect } from 'react';
import api from '../services/api';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  // Estados para Formulario (Crear / Editar)
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', descripcion: '', categoria: '', precio: '', stock: ''
  });
  const [editandoId, setEditandoId] = useState(null);

  // Estados para el Modal de Abastecimiento Estilo SAP
  const [modalVisible, setModalVisible] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [formAbastecimiento, setFormAbastecimiento] = useState({ cantidad: '', motivo: 'Compra a proveedor' });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get('productos/');
      setProductos(response.data);
    } catch (error) {
      mostrarMensaje('Error al cargar el inventario', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Guardar o Actualizar Producto
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
      setFormData({ codigo: '', nombre: '', descripcion: '', categoria: '', precio: '', stock: '' });
      setEditandoId(null);
      fetchProductos();
    } catch (error) {
      mostrarMensaje('Error al guardar. Verifica que el código SKU no esté repetido.', 'danger');
    }
  };

  const prepararEdicion = (producto) => {
    setFormData({
      codigo: producto.codigo_sku || producto.codigo || '',
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      categoria: producto.categoria || '',
      precio: producto.precio || '',
      stock: producto.stock || 0
    });
    setEditandoId(producto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto ${nombre}?`)) {
      try {
        await api.delete(`productos/${id}/`);
        mostrarMensaje('Producto eliminado del catálogo exitosamente', 'success');
        fetchProductos();
      } catch (error) {
        mostrarMensaje('Error al eliminar el producto', 'danger');
      }
    }
  };

  // Controladores del Modal de Abastecimiento
  const abrirModal = (producto) => {
    setProductoActual(producto);
    setFormAbastecimiento({ cantidad: '', motivo: 'Compra a proveedor' });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoActual(null);
  };

  const confirmarAbastecimiento = async () => {
    if (!formAbastecimiento.cantidad || formAbastecimiento.cantidad <= 0) return;
    
    try {
      await api.post(`productos/${productoActual.id}/abastecer/`, {
        cantidad: parseInt(formAbastecimiento.cantidad),
        motivo: formAbastecimiento.motivo
      });
      mostrarMensaje('Inventario actualizado con éxito (Se registró la entrada).', 'success');
      fetchProductos();
      cerrarModal();
    } catch (error) {
      mostrarMensaje('Error al actualizar el inventario.', 'danger');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <h2 className="fw-bold mb-4" style={{ color: 'var(--sap-nav, #00305D)' }}>Gestión de Materiales (Inventario)</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* COLUMNA IZQUIERDA: FORMULARIO CREAR / EDITAR */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header text-white fw-bold" style={{ backgroundColor: editandoId ? 'var(--sap-warning, #C35500)' : 'var(--sap-primary, #0074E2)' }}>
              {editandoId ? 'Editar Material / Producto' : 'Registrar Nuevo Material'}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label fw-semibold">Código SKU *</label>
                  <input type="text" name="codigo" className="form-control" value={formData.codigo} onChange={handleInputChange} required placeholder="Ej: MAT-001" />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold">Nombre del Material *</label>
                  <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej: Resma A4" />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea name="descripcion" className="form-control" rows="2" value={formData.descripcion} onChange={handleInputChange} placeholder="Opcional..."></textarea>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold">Categoría *</label>
                  <input type="text" name="categoria" className="form-control" value={formData.categoria} onChange={handleInputChange} required placeholder="Ej: Papelería" />
                </div>
                <div className="row">
                  <div className="col-6 mb-2">
                    <label className="form-label fw-semibold">Precio (COP) *</label>
                    <input type="number" name="precio" className="form-control" value={formData.precio} onChange={handleInputChange} required min="0" />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Stock Inicial *</label>
                    <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleInputChange} required min="0" />
                  </div>
                </div>
                <button type="submit" className={`btn w-100 fw-bold ${editandoId ? 'btn-warning' : 'btn-primary'}`}>
                  {editandoId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
                {editandoId && (
                  <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => { setEditandoId(null); setFormData({ codigo: '', nombre: '', descripcion: '', categoria: '', precio: '', stock: '' }); }}>
                    Cancelar Edición
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TABLA DE LISTADO */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="m-0 fw-bold" style={{ color: 'var(--sap-nav, #00305D)' }}>Resumen de Stock de Productos</h5>
              <span className="badge bg-secondary">{productos.length} Registros</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#F2F2F2' }}>
                    <tr>
                      <th className="ps-4">Código</th>
                      <th>Material / Producto</th>
                      <th>Categoría</th>
                      <th className="text-end">Precio (COP)</th>
                      <th className="text-center">Stock Real</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-4">Cargando inventario...</td></tr>
                    ) : productos.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4 text-muted">No hay productos registrados.</td></tr>
                    ) : (
                      productos.map(p => (
                        <tr key={p.id}>
                          <td className="ps-4 fw-bold text-muted">{p.codigo_sku || p.codigo}</td>
                          <td className="fw-semibold">
                            {p.nombre}
                            {p.descripcion && <div className="text-muted small text-truncate" style={{maxWidth: '180px'}}>{p.descripcion}</div>}
                          </td>
                          <td><span className="badge bg-info text-dark">{p.categoria}</span></td>
                          <td className="text-end">${Number(p.precio).toLocaleString()}</td>
                          <td className="text-center">
                            <span className={`badge ${p.stock_real > 10 ? 'bg-success' : 'bg-danger'} fs-6`}>
                              {p.stock_real}
                            </span>
                          </td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-primary me-1 mb-1" onClick={() => abrirModal(p)}>
                              Abastecer
                            </button>
                            <button className="btn btn-sm btn-warning me-1 mb-1" onClick={() => prepararEdicion(p)}>
                              Editar
                            </button>
                            <button className="btn btn-sm btn-danger mb-1" onClick={() => handleEliminar(p.id, p.nombre)}>
                              Eliminar
                            </button>
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

      {/* MODAL PERSONALIZADO ESTILO SAP PARA ABASTECIMIENTO */}
      {modalVisible && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: '4px', overflow: 'hidden' }}>
              <div className="modal-header" style={{ backgroundColor: '#003B72', color: 'white', borderRadius: '0' }}>
                <h5 className="modal-title m-0">Ingreso de Mercancía (Abastecimiento)</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body p-4 bg-light">
                <p className="text-muted mb-4">
                  Estás registrando una entrada de stock para el material <strong>{productoActual?.nombre}</strong>.
                </p>
                <div className="mb-3">
                  <label className="form-label fw-bold" style={{ color: '#00305D' }}>Cantidad a Ingresar</label>
                  <input 
                    type="number" 
                    className="form-control form-control-lg" 
                    placeholder="Ej. 50"
                    value={formAbastecimiento.cantidad}
                    onChange={(e) => setFormAbastecimiento({...formAbastecimiento, cantidad: e.target.value})}
                    autoFocus
                    min="1"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold" style={{ color: '#00305D' }}>Motivo del Ingreso</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formAbastecimiento.motivo}
                    onChange={(e) => setFormAbastecimiento({...formAbastecimiento, motivo: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer bg-white">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
                <button type="button" className="btn btn-success" onClick={confirmarAbastecimiento}>Confirmar Ingreso</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;