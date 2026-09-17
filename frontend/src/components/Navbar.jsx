import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/clientes">
          Corferias ERP
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/clientes">Clientes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productos">Inventario</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/ventas">Módulo de Ventas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/historial">Historial</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-btn-dashboard" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/movimientos">Movimientos</Link>
            </li>
          </ul>
          <button className="btn btn-danger btn-sm fw-bold" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;