# Propuestas de Mejora Continua

## 1. Pruebas Automatizadas

- Ampliar las pruebas del backend para validar transacciones de inventario y reglas de negocio de los pedidos.
- Incorporar pruebas E2E en el frontend con Cypress o Playwright para validar Clientes, Inventario, Ventas y Dashboard.

## 2. Pipeline CI/CD

Configurar GitHub Actions para ejecutar en cada pull request:

- Linters de Python y React.
- Pruebas automáticas.
- Migraciones y comprobaciones del backend.
- Construcción de imágenes Docker.

## 3. Optimización y Rendimiento

- Incorporar Redis para cachear cálculos pesados del Dashboard.
- Añadir paginación y filtros para listados grandes de productos, clientes y movimientos.
- Reemplazar los tiempos de espera fijos del arranque por healthchecks de Docker y Kubernetes.

## 4. Seguridad Avanzada

- Mover todos los secretos a variables seguras o gestores de secretos.
- Cambiar las credenciales iniciales antes de producción.
- Restringir CORS y `ALLOWED_HOSTS` por ambiente.
- Configurar expiración y renovación segura de tokens JWT.
