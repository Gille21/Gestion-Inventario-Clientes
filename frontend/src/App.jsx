import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Navbar from './components/Navbar';
import Ventas from './pages/Ventas';
import Historial from './pages/Historial';
import Dashboard from './pages/Dashboard';
import Movimientos from './pages/Movimientos';

// Un pequeño componente envoltorio para decidir si mostrar o no el Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login'];
  
  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movimientos" element={<Movimientos />} />
          
          {/* Ruta 404 Personalizada - Tu punto 3 */}
          <Route path="*" element={
            <div className="container mt-5 text-center">
              <h1 className="display-1 text-danger fw-bold">404</h1>
              <h2>Página no encontrada</h2>
              <p className="lead">La dirección a la que intentas acceder no existe o fue eliminada.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;