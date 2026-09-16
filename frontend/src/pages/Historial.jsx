import { useState, useEffect } from 'react';
import api from '../services/api';

const Historial = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await api.get('pedidos/');
      setPedidos(response.data);
    } catch (error) {
      console.error("Error al cargar historial");
    }
  };

  return (
    <div className="container-fluid px-4 mt-4">
      <h2 className="fw-bold mb-4">Historial de Transacciones</h2>
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>N° Venta</th>
                  <th>Fecha</th>
                  <th>Tienda</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Productos</th>
                  <th>V. Unidad</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th className="bg-success text-white">TOTAL VENTA</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr><td colSpan="10" className="text-center py-4">No hay ventas registradas.</td></tr>
                ) : (
                  pedidos.map(pedido => (
                    <tr key={pedido.id}>
                      <td className="fw-bold text-center">#{pedido.id}</td>
                      <td>{new Date(pedido.fecha_pedido).toLocaleString()}</td>
                      <td>{pedido.tienda_nombre || 'N/A'}</td>
                      <td className="fw-semibold">{pedido.cliente_nombre}</td>
                      <td className="text-muted small">{pedido.cliente_direccion}</td>
                      
                      {/* Celdas con listas anidadas para los detalles */}
                      <td>
                        {pedido.detalles.map((d, i) => <div key={i} className="mb-1">{d.producto_nombre}</div>)}
                      </td>
                      <td className="text-end">
                        {pedido.detalles.map((d, i) => <div key={i} className="mb-1">${Number(d.precio_unitario).toLocaleString()}</div>)}
                      </td>
                      <td className="text-center">
                        {pedido.detalles.map((d, i) => <div key={i} className="mb-1">{d.cantidad}</div>)}
                      </td>
                      <td className="text-end text-primary">
                        {pedido.detalles.map((d, i) => <div key={i} className="mb-1">${(d.cantidad * d.precio_unitario).toLocaleString()}</div>)}
                      </td>
                      
                      <td className="fw-bold text-end bg-light text-success fs-5">
                        ${Number(pedido.total).toLocaleString()}
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
  );
};

export default Historial;