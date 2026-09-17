# Sistema ERP Corporativo - Módulo de Gestión Logística y Comercial (Corferias)

## 1. Descripción General y Decisiones de Diseño

Esta solución es un sistema ERP ligero diseñado para optimizar el control de inventarios (Kardex), la trazabilidad de entradas y salidas de materiales, el registro de operaciones comerciales y la visualización de métricas gerenciales.

- **Frontend:** React con Vite, Bootstrap, Inter y Recharts. Se empaqueta con Nginx mediante un build multi-stage.
- **Backend:** Python con Django y Django REST Framework, con autenticación JWT y API RESTful.
- **Base de datos:** Microsoft SQL Server 2022 ejecutándose en Docker con volumen persistente y conexión mediante ODBC.
- **Arquitectura:** Aplicación desacoplada en contenedores, con MVC en Django y consumo de API orientada a recursos desde React.

## 2. Diagrama de Arquitectura

```text
[ Cliente / Navegador ]
			  |
			  | HTTP / Puerto 80
			  v
+----------------------+
| Frontend (Nginx)     |
+----------+-----------+
			  |
			  | API REST / Puerto 8000
			  v
+----------------------+       +-------------------------+
| Backend (Django)     | ----> | SQL Server 2022         |
+----------------------+       +-------------------------+
```

El usuario interactúa con React servido por Nginx. Las peticiones viajan al backend Django, que ejecuta la lógica de negocio y las transacciones sobre SQL Server.

## 3. Instalación y Ejecución Local con Docker Compose

Requisitos: Docker y Docker Compose.

1. Ubícate en la raíz del proyecto.
2. Crea un archivo `.env` con la variable requerida:

	```env
	SA_PASSWORD=Corferias123*
	```

3. Levanta el entorno:

	```bash
	docker compose down -v
	docker compose up --build
	```

El backend ejecuta las migraciones y `seed_db`, que carga tiendas, productos, clientes, usuario administrador y ventas demo para el Dashboard.

- Frontend: http://localhost
- API: http://localhost:8000
- Administración Django: http://localhost:8000/admin/
- Swagger: http://localhost:8000/swagger/

## 4. Despliegue en K3s / Kubernetes

Los manifiestos disponibles en `k8s/` son:

1. `db.yaml`: despliegue y servicio de SQL Server.
2. `backend.yaml`: despliegue y servicio de Django.
3. `frontend.yaml`: despliegue y servicio de Nginx.

Ejemplo de aplicación:

```bash
kubectl apply -f k8s/db.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

Para un entorno real se recomienda separar secretos y variables sensibles en objetos `Secret` de Kubernetes, en lugar de mantenerlos en texto plano.

## 5. Control de Acceso y Gestión de Usuarios

La aplicación utiliza autenticación JWT. Durante `seed_db`, si no existe, se crea el superusuario inicial:

- Usuario: `admin`
- Contraseña: `Corferias123*`

Estas credenciales son únicamente de demostración y deben cambiarse antes de cualquier despliegue real.

No existe autoregistro público. Los usuarios se administran desde el panel de Django (`/admin/`) o mediante procedimientos controlados de backend, evitando que cualquier visitante obtenga acceso a inventario, clientes o transacciones.

## 6. Documentación de la API

La documentación resumida de los endpoints se encuentra en [docs/api.md](docs/api.md). También está disponible Swagger en `/swagger/` cuando el backend está en ejecución.

## 7. Guía de Trazabilidad

La guía para gestionar incidencias, tareas y cambios se encuentra en [docs/trazabilidad.md](docs/trazabilidad.md).

## 8. Propuestas de Mejora Continua

La hoja de ruta técnica se encuentra en [docs/mejora_continua.md](docs/mejora_continua.md).

## 9. Registro de Uso de IA

El registro de colaboración con herramientas de IA se encuentra en [docs/ia/prompts_y_flujos.md](docs/ia/prompts_y_flujos.md).

## 10. Despliegue en K3s

La estrategia de despliegue Kubernetes, el orden de aplicación y la guía de validación local se encuentran en [docs/kubernetes_k3s.md](docs/kubernetes_k3s.md).

## 11. Modelo Entidad-Relación

El diagrama entidad-relación y la explicación de las relaciones de la base de datos se encuentran en [docs/modelo_entidad_relacion.md](docs/modelo_entidad_relacion.md).
