from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cliente, Tienda, Producto, MovimientoInventario, ReservaStock, Pedido
from .serializers import ClienteSerializer, TiendaSerializer, ProductoSerializer, MovimientoInventarioSerializer, PedidoSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.filter(activo=True)
    serializer_class = ClienteSerializer

class TiendaViewSet(viewsets.ModelViewSet):
    queryset = Tienda.objects.all()
    serializer_class = TiendaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    # Solo mostramos productos activos para las ventas (Punto 3)
    queryset = Producto.objects.filter(estado=True)
    serializer_class = ProductoSerializer

    @action(detail=True, methods=['post'])
    def abastecer(self, request, pk=None):
        producto = self.get_object()
        cantidad = int(request.data.get('cantidad', 0))
        motivo = request.data.get('motivo', 'Abastecimiento de proveedor')

        if cantidad <= 0:
            return Response({"error": "La cantidad debe ser mayor a 0"}, status=status.HTTP_400_BAD_REQUEST)

        # Sumamos el stock
        producto.stock += cantidad
        producto.save()

        # Registramos el movimiento de ENTRADA
        MovimientoInventario.objects.create(
            producto=producto,
            tipo_movimiento='ENTRADA',
            cantidad=cantidad,
            motivo=motivo,
            usuario=request.user if request.user.is_authenticated else None
        )

        return Response({"mensaje": "Stock ingresado exitosamente", "nuevo_stock": producto.stock}, status=status.HTTP_200_OK)
    @action(detail=True, methods=['post'])
    def reservar(self, request, pk=None):
        producto = self.get_object()
        cantidad_solicitada = int(request.data.get('cantidad', 0))
        
        serializer = self.get_serializer(producto)
        stock_real = serializer.data['stock_real']

        if cantidad_solicitada <= 0 or cantidad_solicitada > stock_real:
            return Response(
                {"error": f"Stock insuficiente. Solo hay {stock_real} unidades disponibles."},
                status=status.HTTP_400_BAD_REQUEST
            )

        expiracion = timezone.now() + timedelta(minutes=5)
        reserva = ReservaStock.objects.create(
            producto=producto,
            cantidad=cantidad_solicitada,
            expira_en=expiracion
        )

        return Response({
            "mensaje": "Stock reservado exitosamente.",
            "reserva_id": reserva.id,
            "expira_en": expiracion,
            "cantidad_reservada": reserva.cantidad
        }, status=status.HTTP_200_OK)

class MovimientoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MovimientoInventarioSerializer
    queryset = MovimientoInventario.objects.all()

    def get_queryset(self):
        queryset = MovimientoInventario.objects.all().order_by('-fecha')
        producto_id = self.request.query_params.get('producto')
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')

        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)
        if fecha_inicio:
            queryset = queryset.filter(fecha__date__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__date__lte=fecha_fin)
            
        return queryset

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-fecha_pedido')
    serializer_class = PedidoSerializer