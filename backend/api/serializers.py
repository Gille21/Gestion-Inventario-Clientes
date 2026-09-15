from rest_framework import serializers
from django.utils import timezone
from django.db.models import Sum
from .models import Cliente, Tienda, Producto, MovimientoInventario, ReservaStock, Pedido, DetallePedido

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class TiendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tienda
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    # Aquí calculamos el "Stock Real" restando las reservas activas (Tu Escenario 3)
    stock_real = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = '__all__'

    def get_stock_real(self, obj):
        # Sumar todas las cantidades de este producto que están reservadas y no han expirado
        reservas_activas = ReservaStock.objects.filter(
            producto=obj,
            expira_en__gt=timezone.now()
        ).aggregate(total=Sum('cantidad'))['total'] or 0
        
        # El frontend verá el stock actual menos lo que otros usuarios tienen bloqueado
        return obj.stock - reservas_activas

class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoInventario
        fields = '__all__'

class ReservaStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservaStock
        fields = '__all__'