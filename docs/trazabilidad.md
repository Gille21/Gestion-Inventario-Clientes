# Guía de Trazabilidad y Gestión de Incidencias

Para mantener un control riguroso del ciclo de vida del software, el desarrollo de este ERP puede gestionarse mediante un tablero Kanban y prácticas de revisión de código.

## 1. Product Backlog y Épicas

Los requerimientos funcionales se dividen en épicas principales:

- Módulo de autenticación.
- Control de inventario y Kardex.
- Gestión de clientes y tiendas.
- Punto de venta.
- Dashboard financiero y operativo.

## 2. Flujo de Tareas

- **New / To Do:** requerimientos pendientes por desarrollar.
- **Active / In Progress:** tareas en desarrollo activo.
- **Code Review:** revisión cruzada y validación de buenas prácticas.
- **Done:** funcionalidad probada y disponible en el entorno objetivo.

## 3. Gestión de Incidencias

Ante un fallo, por ejemplo un error de conexión ODBC con SQL Server, el ticket debe incluir:

- Pasos para reproducirlo.
- Resultado esperado y resultado actual.
- Logs del contenedor afectado, por ejemplo `docker logs corferias_backend`.
- Severidad: alta, media o baja.
- Desarrollador asignado.
- Referencia al commit o pull request de la corrección.

## 4. Trazabilidad de Cambios

Cada cambio debe relacionarse con una tarea o incidencia, describir su impacto y registrar las validaciones ejecutadas, como pruebas, lint, migraciones o compilación del frontend.
