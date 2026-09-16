    import { useState, useEffect } from 'react';
import api from '../services/api';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'success' | 'danger', texto: '' }
  const [formData, setFormData] = useState({
    identificacion: '', nombre: '', correo: '', telefono: '', direccion: ''
  });
  const [editandoId, setEditandoId] = useState(null);

  // Cargar clientes al iniciar
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await api.get('clientes/');
      setClientes(response.data);
    } catch (error) {
      mostrarMensaje('Error al cargar los clientes', 'danger');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000); // Se oculta a los 4 segundos
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Crear o Actualizar Cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`clientes/${editandoId}/`, formData);
        mostrarMensaje('Cliente actualizado exitosamente', 'success');
      } else {
        await api.post('clientes/', formData);
        mostrarMensaje('Cliente registrado exitosamente', 'success');
      }
      setFormData({ identificacion: '', nombre: '', correo: '', telefono: '', direccion: '' });
      setEditandoId(null);
      fetchClientes();
    } catch (error) {
      mostrarMensaje('Error al guardar. Verifica que la identificación o correo no estén repetidos.', 'danger');
    }
  };

  const prepararEdicion = (cliente) => {
    setFormData(cliente);
    setEditandoId(cliente.id);
  };

  // Eliminar Cliente (Popup de confirmación)
  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al cliente ${nombre}?`)) {
      try {
        // Hacemos una actualización parcial para cambiar activo=false (Eliminación lógica)
        await api.patch(`clientes/${id}/`, { activo: false });
        mostrarMensaje('Cliente eliminado exitosamente', 'success');
        fetchClientes();
      } catch (error) {
        mostrarMensaje('Error al eliminar el cliente', 'danger');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Módulo de Clientes</h2>

      {/* Alertas popups superiores */}
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row">
        {/* FORMULARIO */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white fw-bold">
              {editandoId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="form-label">Identificación (NIT/CC) *</label>
                  <input type="text" name="identificacion" className="form-control" value={formData.identificacion} onChange={handleInputChange} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Nombre o Razón Social *</label>
                  <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleInputChange} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Correo *</label>
                  <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleInputChange} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Teléfono *</label>
                  <input type="text" name="telefono" className="form-control" value={formData.telefono} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Dirección *</label>
                  <input type="text" name="direccion" className="form-control" value={formData.direccion} onChange={handleInputChange} required />
                </div>
                <button type="submit" className={`btn w-100 fw-bold ${editandoId ? 'btn-warning' : 'btn-primary'}`}>
                  {editandoId ? 'Actualizar Datos' : 'Guardar Cliente'}
                </button>
                {editandoId && (
                  <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => { setEditandoId(null); setFormData({ identificacion: '', nombre: '', correo: '', telefono: '', direccion: '' }); }}>
                    Cancelar Edición
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* TABLA DE LISTADO */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Identificación</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.length === 0 ? (
                      <tr><td colSpan="5" className="text-center text-muted">No hay clientes registrados.</td></tr>
                    ) : (
                      clientes.map((cliente) => (
                        <tr key={cliente.id}>
                          <td>{cliente.identificacion}</td>
                          <td className="fw-semibold">{cliente.nombre}</td>
                          <td>{cliente.correo}</td>
                          <td>{cliente.telefono}</td>
                          <td>{new Date(cliente.fecha_registro).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => prepararEdicion(cliente)}>Editar</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(cliente.id, cliente.nombre)}>Eliminar</button>
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

export default Clientes;