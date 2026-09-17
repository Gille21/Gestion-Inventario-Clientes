# Registro de Uso de Herramientas de Inteligencia Artificial

Durante el desarrollo del ERP para Corferias se utilizaron asistentes de IA como apoyo para investigar, diseñar y revisar partes del proyecto. La IA fue usada como herramienta de colaboración; las decisiones finales y la validación del código corresponden al equipo del proyecto.

## 1. Arquitectura y Contenedores Docker

Se solicitaron recomendaciones para estructurar `docker-compose.yml`.

## 2. Generación de Datos Iniciales

Se diseñó y revisó `seed_db.py` para automatizar la creación de tiendas, productos, clientes, usuario administrador, stock y transacciones demo para alimentar el Dashboard.

## 3. Diseño de Interfaz y Gráficas

Se utilizó IA como apoyo para integrar componentes de Recharts y aplicar estilos CSS corporativos con Bootstrap, incluyendo tipografía, navegación, tarjetas, tablas y botones.

## 4. Revisión y Depuración

Se consultó a la IA para analizar errores de integración, verificar nombres de campos y relaciones de Django, mejorar la idempotencia del seed y revisar los cambios del frontend.

## 5. Documentación Técnica

La IA apoyó la edición y organización del `README.md` y la creación de la documentación complementaria en formato Markdown. Esto incluyó:

- Descripción general de la arquitectura y las decisiones de diseño.
- Instrucciones de instalación con Docker Compose.
- Guía de despliegue y validación en Kubernetes/K3s.
- Documentación resumida de los endpoints de la API.
- Guía de trazabilidad y gestión de incidencias.
- Propuestas de mejora continua.
- Diagrama entidad-relación de la base de datos y explicación de sus relaciones.

También se revisaron los enlaces internos del README y se ajustó el contenido para que correspondiera con los archivos reales del repositorio.

## 6. Validación

Las sugerencias generadas se contrastaron con los modelos, serializers, vistas, archivos de configuración, manifiestos Kubernetes y comandos de ejecución del repositorio antes de incorporarlas. La revisión final del contenido y la decisión de aceptar los cambios correspondieron al equipo del proyecto.
