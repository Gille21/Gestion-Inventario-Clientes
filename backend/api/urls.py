from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, TiendaViewSet, ProductoViewSet, MovimientoViewSet, PedidoViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'tiendas', TiendaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'movimientos', MovimientoViewSet, basename='movimiento') # <-- Única línea limpia
router.register(r'pedidos', PedidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]