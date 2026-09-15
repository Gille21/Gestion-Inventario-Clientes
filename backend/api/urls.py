from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, TiendaViewSet, ProductoViewSet

# El DefaultRouter crea automáticamente todos los endpoints del CRUD (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'tiendas', TiendaViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]