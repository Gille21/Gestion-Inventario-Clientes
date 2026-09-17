import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Hacemos la petición al endpoint JWT que creamos en Django
      const response = await api.post('token/', {
        username,
        password,
      });

      // Si es exitoso, guardamos el token de acceso en el navegador
      localStorage.setItem('token', response.data.access);
      
      // Redirigimos al usuario a la página de ventas/clientes
      navigate('/clientes');
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Corferias ERP</h2>
            <p className="text-muted">Ingresa tus credenciales para continuar</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Usuario</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 fw-bold"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;