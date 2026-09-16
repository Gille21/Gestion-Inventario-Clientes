import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paleta de colores para los gráficos de pastel
  const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('pedidos/');
      setPedidos(response.data);
    } catch (error) {
      console.error("Error al cargar datos para el dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LÓGICA DE TABLAS DINÁMICAS (KPIs)
  // ==========================================
  
  // 1. KPI Generales
  const totalIngresos = pedidos.reduce((sum, p) => sum + parseFloat(p.total), 0);
  const totalVentas = pedidos.length;

  // 2. Ventas por Tienda (Para gráfico de Pastel)
  const ventasPorTiendaObj = pedidos.reduce((acc, pedido) => {
    const tienda = pedido.tienda_nombre || 'Sin Tienda';
    acc[tienda] = (acc[tienda] || 0) + parseFloat(pedido.total);
    return acc;
  }, {});
  
  const datosTienda = Object.keys(ventasPorTiendaObj).map(key => ({
    name: key,
    valor: ventasPorTiendaObj[key]
  }));

  // 3. Productos más Vendidos (Para gráfico de Barras)
  const ventasPorProductoObj = pedidos.reduce((acc, pedido) => {
    pedido.detalles.forEach(detalle => {
      acc[detalle.producto_nombre] = (acc[detalle.producto_nombre] || 0) + detalle.cantidad;
    });
    return acc;
  }, {});

  const datosProductos = Object.keys(ventasPorProductoObj)
    .map(key => ({ name: key, cantidad: ventasPorProductoObj[key] }))
    .sort((a, b) => b.cantidad - a.cantidad) // Ordenar de mayor a menor
    .slice(0, 5); // Mostrar solo el Top 5

  // 4. Top Clientes (Mejores compradores)
  const ventasPorClienteObj = pedidos.reduce((acc, pedido) => {
    acc[pedido.cliente_nombre] = (acc[pedido.cliente_nombre] || 0) + parseFloat(pedido.total);
    return acc;
  }, {});

  const datosClientes = Object.keys(ventasPorClienteObj)
    .map(key => ({ name: key, total: ventasPorClienteObj[key] }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);


  if (loading) return <div className="text-center mt-5">Cargando métricas...</div>;

  return (
    <div className="container-fluid px-4 mt-4 mb-5">
      <h2 className="fw-bold mb-4 text-primary">Dashboard de Operaciones</h2>

      {/* FILA 1: Tarjetas de Resumen Rápido */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white h-100">
            <div className="card-body py-4 text-center">
              <h5 className="card-title text-uppercase fw-semibold mb-3">Ingresos Totales</h5>
              <h2 className="display-5 fw-bold">${totalIngresos.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-success text-white h-100">
            <div className="card-body py-4 text-center">
              <h5 className="card-title text-uppercase fw-semibold mb-3">Ventas Concretadas</h5>
              <h2 className="display-5 fw-bold">{totalVentas}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-warning text-dark h-100">
            <div className="card-body py-4 text-center">
              <h5 className="card-title text-uppercase fw-semibold mb-3">Promedio por Venta</h5>
              <h2 className="display-5 fw-bold">
                ${totalVentas > 0 ? Math.round(totalIngresos / totalVentas).toLocaleString() : 0}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* FILA 2: Gráficos Principales */}
      <div className="row mb-4">
        {/* Gráfico de Barras: Top 5 Productos */}
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold">Top 5 Productos Más Vendidos (Unidades)</div>
            <div className="card-body" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosProductos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Ventas']} />
                  <Bar dataKey="cantidad" fill="#0d6efd" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de Pastel: Ingresos por Tienda */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold">Distribución de Ingresos por Tienda</div>
            <div className="card-body" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={datosTienda} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="valor">
                    {datosTienda.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* FILA 3: Top Clientes */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">Top Clientes (Mayor volumen de compra)</div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Posición</th>
                    <th>Cliente</th>
                    <th className="text-end pe-4">Total Invertido</th>
                  </tr>
                </thead>
                <tbody>
                  {datosClientes.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-4">No hay datos suficientes</td></tr>
                  ) : (
                    datosClientes.map((cliente, index) => (
                      <tr key={index}>
                        <td className="ps-4 fw-bold text-muted">#{index + 1}</td>
                        <td className="fw-semibold">{cliente.name}</td>
                        <td className="text-end pe-4 text-success fw-bold">${cliente.total.toLocaleString()}</td>
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
  );
};

export default Dashboard;