import { useState, useEffect } from 'react';
import api from '../services/api';

const Ventas = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiendas, setTiendas] = useState([]); // <-- Estado para las tiendas
  
  // Estados del formulario y carrito
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(''); // <-- Estado para la tienda seleccionada
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Hacemos las 3 peticiones al mismo tiempo
      const [resClientes, resProductos, resTiendas] = await Promise.all([
        api.get('clientes/'),
        api.get('productos/'),
        api.get('tiendas/')
      ]);
      setClientes(resClientes.data);
      setProductos(resProductos.data);
      setTiendas(resTiendas.data); // <-- Guardamos las tiendas en el estado
    } catch (error) {
      mostrarMensaje('Error al cargar datos del servidor', 'danger');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  };

  // REGLA DEL 75%: Calcula el stock seguro a mostrar
  const getStockVisible = (stockReal) => {
    return Math.floor(stockReal * 0.75);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    const producto = productos.find(p => p.id === parseInt(productoSeleccionado));
    const stockVisible = getStockVisible(producto.stock_real);

    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    const cantidadTotal = itemExistente ? itemExistente.cantidad + parseInt(cantidad) : parseInt(cantidad);

    if (cantidadTotal > stockVisible) {
      mostrarMensaje(`Stock de seguridad superado. Solo puedes vender hasta ${stockVisible} unidades de ${producto.nombre}.`, 'warning');
      return;
    }

    if (itemExistente) {
      setCarrito(carrito.map(item => 
        item.producto_id === producto.id 
          ? { ...item, cantidad: cantidadTotal, subtotal: cantidadTotal * item.precio_unitario }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: parseInt(cantidad),
        precio_unitario: producto.precio,
        subtotal: parseInt(cantidad) * producto.precio,
        stock_visible: stockVisible
      }]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.producto_id !== productoId));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };

  const concretarVenta = async () => {
    if (!clienteSeleccionado || !tiendaSeleccionada) {
      mostrarMensaje('Debes seleccionar un cliente y una tienda para la venta', 'warning');
      return;
    }
    if (carrito.length === 0) {
      mostrarMensaje('El carrito está vacío', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cliente: clienteSeleccionado,
        tienda: tiendaSeleccionada, // <-- Se envía la tienda al backend
        detalles: carrito.map(item => ({
          producto: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      };

      await api.post('pedidos/', payload);
      
      mostrarMensaje('¡Venta registrada exitosamente! Stock actualizado.', 'success');
      setCarrito([]);
      setClienteSeleccionado('');
      setTiendaSeleccionada('');
      
      fetchData();
    } catch (error) {
      if (error.response && error.response.data) {
        mostrarMensaje(`Error en la venta: ${JSON.stringify(error.response.data)}`, 'danger');
      } else {
        mostrarMensaje('Ocurrió un error al procesar la venta.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 mt-4">
      <h2 className="fw-bold mb-4">Módulo de Ventas (Punto de Pago)</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row">
        {/* PANEL IZQUIERDO: SELECCIÓN */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white fw-bold">1. Datos de Venta</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Cliente</label>
                <select className="form-select" value={clienteSeleccionado} onChange={(e) => setClienteSeleccionado(e.target.value)}>
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.identificacion} - {c.nombre}</option>
                  ))}
                </select>
              </div>
              
              {/* Nuevo Select de Tiendas */}
              <div>
                <label className="form-label">Tienda / Punto de Venta</label>
                <select className="form-select" value={tiendaSeleccionada} onChange={(e) => setTiendaSeleccionada(e.target.value)}>
                  <option value="">-- Seleccionar Tienda --</option>
                  {tiendas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} ({t.ubicacion})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">2. Agregar Productos</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Producto</label>
                <select className="form-select" value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
                  <option value="">-- Seleccionar Producto --</option>
                  {productos.map(p => {
                    const stockSeguro = getStockVisible(p.stock_real);
                    return (
                      <option key={p.id} value={p.id} disabled={stockSeguro === 0}>
                        {p.nombre} - ${Number(p.precio).toLocaleString()} (Disp: {stockSeguro})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="row">
                <div className="col-6">
                  <label className="form-label">Cantidad</label>
                  <input type="number" className="form-control" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                </div>
                <div className="col-6 d-flex align-items-end">
                  <button className="btn btn-success w-100 fw-bold" onClick={agregarAlCarrito} disabled={!productoSeleccionado}>
                    Añadir al Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: CARRITO Y CHECKOUT */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white fw-bold">3. Resumen del Pedido</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Producto</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-end">V. Unitario</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-center pe-3">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.length === 0 ? (
                      <tr><td colSpan="5" className="text-center text-muted py-4">Aún no has agregado productos al pedido.</td></tr>
                    ) : (
                      carrito.map(item => (
                        <tr key={item.producto_id}>
                          <td className="ps-3 fw-semibold">{item.nombre}</td>
                          <td className="text-center">{item.cantidad}</td>
                          <td className="text-end">${Number(item.precio_unitario).toLocaleString()}</td>
                          <td className="text-end fw-bold">${Number(item.subtotal).toLocaleString()}</td>
                          <td className="text-center pe-3">
                            <button className="btn btn-sm btn-danger rounded-circle" onClick={() => eliminarDelCarrito(item.producto_id)}>
                              X
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-white p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-muted mb-0">Total a Pagar:</h4>
                <h2 className="text-primary fw-bold mb-0">${calcularTotal().toLocaleString()}</h2>
              </div>
              <button 
                className="btn btn-primary btn-lg w-100 fw-bold" 
                onClick={concretarVenta}
                disabled={loading || carrito.length === 0 || !clienteSeleccionado || !tiendaSeleccionada}
              >
                {loading ? 'Procesando Venta...' : 'Concretar Venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventas;