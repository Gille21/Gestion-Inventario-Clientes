import { useState, useEffect } from 'react';
import api from '../services/api';

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtros, setFiltros] = useState({ producto: '', fecha_inicio: '', fecha_fin: '' });

  useEffect(() => {
    // Cargar la lista de productos para el selector
    api.get('productos/').then(res => setProductos(res.data));
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async (filtrosActivos = filtros) => {
    try {
      // Construimos los parámetros de la URL para el filtro
      const params = new URLSearchParams();
      if (filtrosActivos.producto) params.append('producto', filtrosActivos.producto);
      if (filtrosActivos.fecha_inicio) params.append('fecha_inicio', filtrosActivos.fecha_inicio);
      if (filtrosActivos.fecha_fin) params.append('fecha_fin', filtrosActivos.fecha_fin);

      const response = await api.get(`movimientos/?${params.toString()}`);
      setMovimientos(response.data);
    } catch (error) {
      console.error("Error al cargar movimientos");
    }
  };

  const handleFiltroChange = (e) => {
    const nuevosFiltros = { ...filtros, [e.target.name]: e.target.value };
    setFiltros(nuevosFiltros);
    fetchMovimientos(nuevosFiltros); // Filtrado en tiempo real
  };

  const limpiarFiltros = () => {
    const limpios = { producto: '', fecha_inicio: '', fecha_fin: '' };
    setFiltros(limpios);
    fetchMovimientos(limpios);
  };

  return (
    <div className="container-fluid px-4 mt-4 mb-5">
      <h2 className="fw-bold mb-4 text-primary">Kardex / Trazabilidad de Inventario</h2>
      
      {/* Panel de Filtros */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label fw-bold text-muted">Filtrar por Producto</label>
              <select name="producto" className="form-select" value={filtros.producto} onChange={handleFiltroChange}>
                <option value="">-- Todos los Productos --</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <label className="form-label fw-bold text-muted">Desde (Fecha)</label>
              <input type="date" name="fecha_inicio" className="form-control" value={filtros.fecha_inicio} onChange={handleFiltroChange} />
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <label className="form-label fw-bold text-muted">Hasta (Fecha)</label>
              <input type="date" name="fecha_fin" className="form-control" value={filtros.fecha_fin} onChange={handleFiltroChange} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-secondary w-100" onClick={limpiarFiltros}>Limpiar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th className="text-center">Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No se encontraron movimientos.</td></tr>
                ) : (
                  movimientos.map(mov => (
                    <tr key={mov.id}>
                      <td className="text-muted">{new Date(mov.fecha).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${mov.tipo_movimiento === 'ENTRADA' ? 'bg-success' : 'bg-danger'}`}>
                          {mov.tipo_movimiento}
                        </span>
                      </td>
                      <td className="fw-semibold">{mov.producto_nombre}</td>
                      <td className={`text-center fw-bold ${mov.tipo_movimiento === 'ENTRADA' ? 'text-success' : 'text-danger'}`}>
                        {mov.tipo_movimiento === 'ENTRADA' ? '+' : '-'}{mov.cantidad}
                      </td>
                      <td className="fst-italic">{mov.motivo}</td>
                      <td>{mov.usuario_nombre || 'Sistema'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movimientos;