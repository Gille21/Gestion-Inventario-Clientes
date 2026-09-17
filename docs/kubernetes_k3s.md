# Documentación y Estrategia de Despliegue en K3s (Kubernetes)

Como parte de los estándares de arquitectura Cloud-Native de este ERP, la solución cuenta con manifiestos de infraestructura como código (IaC) para su orquestación en un clúster Kubernetes ligero (K3s).

## 1. Alcance y Enfoque de Despliegue

Siguiendo las directrices del proyecto y priorizando una entrega funcional completa, la ejecución principal y validación en caliente de la aplicación se realiza mediante Docker Compose en el entorno local.

Los manifiestos de Kubernetes están estructurados por capas y preparados para una validación en un clúster local. La separación de responsabilidades contempla la base de datos, el backend y el frontend. Para un entorno productivo real, los valores sensibles deben trasladarse a recursos `Secret` y los volúmenes deben configurarse según el proveedor de almacenamiento utilizado.

## 2. Manifiestos Disponibles en Este Repositorio

Los manifiestos actuales están consolidados en tres archivos dentro de `k8s/`:

1. `k8s/db.yaml`
   - Despliega SQL Server 2022 y su servicio interno.
   - Define el volumen persistente para los datos de SQL Server.

2. `k8s/backend.yaml`
   - Despliega la API Django.
   - Ejecuta migraciones, carga el seed y expone el puerto 8000.
   - Se conecta a SQL Server mediante variables de entorno.

3. `k8s/frontend.yaml`
   - Despliega el frontend React servido por Nginx.
   - Expone la interfaz web mediante el servicio definido en el manifiesto.

En una evolución futura se pueden separar estos recursos en archivos independientes para secretos, PVC, deployment y service, manteniendo la misma separación por capas.

## 3. Orden de Aplicación de los Manifiestos YAML

Si un evaluador o administrador desea simular o desplegar esta arquitectura en un clúster K3s utilizando `k3d`, `minikube` o un nodo con K3s instalado, el orden recomendado es:

1. Base de datos:

   ```bash
   kubectl apply -f k8s/db.yaml
   ```

2. Backend:

   ```bash
   kubectl apply -f k8s/backend.yaml
   ```

3. Frontend:

   ```bash
   kubectl apply -f k8s/frontend.yaml
   ```

La base de datos debe estar disponible antes de iniciar el backend. El backend debe estar disponible antes de validar el acceso completo desde el frontend.

## 4. Validación Local Recomendada

Para validar los manifiestos en un entorno de desarrollo sin infraestructura pesada, se recomienda utilizar **K3d** (K3s in Docker):

```bash
k3d cluster create corferias-cluster
kubectl apply -f k8s/db.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl get pods
kubectl get services
```

También es posible aplicar todos los manifiestos de una vez:

```bash
kubectl apply -f k8s/
```

Para revisar los detalles de un recurso o diagnosticar problemas:

```bash
kubectl describe pods
kubectl logs deployment/backend-deployment
kubectl logs deployment/frontend-deployment
```

## 5. Buenas Prácticas para Producción

- Gestionar `SA_PASSWORD`, claves JWT y demás credenciales mediante `Secret` de Kubernetes.
- Utilizar `PersistentVolumeClaim` con una clase de almacenamiento adecuada para SQL Server.
- Añadir `readinessProbe` y `livenessProbe` para controlar la disponibilidad de los servicios.
- Evitar `DEBUG=True` y restringir `ALLOWED_HOSTS` y CORS por ambiente.
- Utilizar imágenes versionadas en lugar de depender de la etiqueta `latest`.
- Configurar un `Ingress` o un servicio `NodePort` según la infraestructura disponible.
