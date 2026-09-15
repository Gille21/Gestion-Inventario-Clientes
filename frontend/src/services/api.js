import axios from 'axios';

// Creamos una instancia de Axios con la URL base de tu backend
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// "Interceptamos" cada petición antes de que salga para inyectarle el Token de seguridad
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api; 