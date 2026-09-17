import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // PALETA DE COLORES SAP (Secuencia ejecutiva)
  const SAP_COLORS = ['#003B72', '#166EFF', '#0055C3', '#62B3FF', '#3F92FF', '#0074E2', '#0055A5'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('pedidos/');
      setPedidos(response.data);
    } catch (error) {
      console.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const totalIngresos = pedidos.reduce((sum, p) => sum + parseFloat(p.total), 0);
  const totalVentas = pedidos.length;

  // Gráfico de Pastel (Tiendas)
  const ventasPorTiendaObj = pedidos.reduce((acc, pedido) => {
    const tienda = pedido.tienda_nombre || 'Sin Tienda';
    acc[tienda] = (acc[tienda] || 0) + parseFloat(pedido.total);
    return acc;
  }, {});
  const datosTienda = Object.keys(ventasPorTiendaObj).map(key => ({ name: key, valor: ventasPorTiendaObj[key] }));

  // Gráfico de Barras (Productos)
  const ventasPorProductoObj = pedidos.reduce((acc, pedido) => {
    pedido.detalles.forEach(detalle => {
      acc[detalle.producto_nombre] = (acc[detalle.producto_nombre] || 0) + detalle.cantidad;
    });
    return acc;
  }, {});
  const datosProductos = Object.keys(ventasPorProductoObj)
    .map(key => ({ name: key, cantidad: ventasPorProductoObj[key] }))
    .sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  return (
    /* Quitamos el backgroundColor quemado para usar el del index.css */
    <div className="container-fluid px-4 py-5"> 
      
      {/* HEADER DEL DASHBOARD */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <h2 className="fw-bold m-0" style={{ color: 'var(--sap-nav)', borderLeft: '6px solid var(--sap-primary)', paddingLeft: '16px' }}>
          Visión General del Negocio
        </h2>
        <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
          Métricas en tiempo real
        </span>
      </div>

      {/* FILA 1: KPIs (Estilo Bloque Gerencial) */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm" style={{ borderTop: '5px solid var(--sap-success)' }}>
            <div className="card-body p-4">
              <h6 className="text-uppercase text-muted fw-bold mb-2" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>
                Volumen de Ingresos
              </h6>
              <h1 className="display-6 fw-bolder mb-0" style={{ color: 'var(--sap-nav)' }}>
                ${totalIngresos.toLocaleString()}
              </h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm" style={{ borderTop: '5px solid var(--sap-primary)' }}>
            <div className="card-body p-4">
              <h6 className="text-uppercase text-muted fw-bold mb-2" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>
                Total de Operaciones
              </h6>
              <h1 className="display-6 fw-bolder mb-0" style={{ color: 'var(--sap-nav)' }}>
                {totalVentas} <span className="text-muted fw-normal fs-5">Transacciones</span>
              </h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm" style={{ borderTop: '5px solid var(--sap-warning)' }}>
            <div className="card-body p-4">
              <h6 className="text-uppercase text-muted fw-bold mb-2" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>
                Ticket Promedio
              </h6>
              <h1 className="display-6 fw-bolder mb-0" style={{ color: 'var(--sap-nav)' }}>
                ${totalVentas > 0 ? Math.round(totalIngresos / totalVentas).toLocaleString() : 0}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* FILA 2: Gráficos distribuidos */}
      <div className="row g-4">
        
        {/* GRÁFICO DE BARRAS MULTICOLOR */}
        <div className="col-lg-8">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
              <h5 className="m-0" style={{ color: 'var(--sap-nav)', fontWeight: '700' }}>Movimiento de Materiales (Top 5)</h5>
            </div>
            <div className="card-body px-4 pb-4" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosProductos} margin={{ top: 20, right: 30, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{fill: '#6B7280', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 'bold', color: 'var(--sap-nav)' }} 
                  />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} barSize={45}>
                    {datosProductos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SAP_COLORS[index % SAP_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRÁFICO DE PASTEL */}
        <div className="col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
              <h5 className="m-0" style={{ color: 'var(--sap-nav)', fontWeight: '700' }}>Ingresos por Ubicación</h5>
            </div>
            <div className="card-body px-4 pb-4 d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={datosTienda} cx="50%" cy="50%" innerRadius={85} outerRadius={130} paddingAngle={3} dataKey="valor" stroke="none">
                    {datosTienda.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SAP_COLORS[index % SAP_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 'bold', color: 'var(--sap-nav)' }} 
                  />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '500', color: '#4B5563' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;