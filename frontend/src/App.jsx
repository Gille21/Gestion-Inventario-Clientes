import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Aquí irá nuestro Navbar más adelante */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<h1>Bienvenido al Sistema Corferias</h1>} />
            {/* Aquí agregaremos las rutas de Login, Inventario y Clientes */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;