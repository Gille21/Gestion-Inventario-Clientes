from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from .models import Cliente, Tienda, Producto, ReservaStock
from .serializers import ClienteSerializer, TiendaSerializer, ProductoSerializer

# ==========================================
# CONTROLADORES (VIEWS)
# ==========================================

class ClienteViewSet(viewsets.ModelViewSet):
    """CRUD de Clientes. Solo mostramos los activos (Eliminación lógica)"""
    queryset = Cliente.objects.filter(activo=True)
    serializer_class = ClienteSerializer

class TiendaViewSet(viewsets.ModelViewSet):
    """CRUD de Tiendas"""
    queryset = Tienda.objects.all()
    serializer_class = TiendaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """CRUD de Productos y lógica de reservas"""
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    # Acción personalizada para el Escenario 3 (Bloqueo de Stock)
    @action(detail=True, methods=['post'])
    def reservar(self, request, pk=None):
        producto = self.get_object()
        cantidad_solicitada = int(request.data.get('cantidad', 0))
        
        # Obtenemos el stock_real calculado en el serializador
        serializer = self.get_serializer(producto)
        stock_real = serializer.data['stock_real']

        # Escenario 2: Validar si pide más del stock disponible
        if cantidad_solicitada <= 0 or cantidad_solicitada > stock_real:
            return Response(
                {"error": f"Stock insuficiente. Solo hay {stock_real} unidades reales disponibles."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Escenario 3: Crear el bloqueo temporal (5 minutos)
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