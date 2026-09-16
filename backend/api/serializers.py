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
    stock_real = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = '__all__'

    def get_stock_real(self, obj):
        reservas_activas = ReservaStock.objects.filter(
            producto=obj,
            expira_en__gt=timezone.now()
        ).aggregate(total=Sum('cantidad'))['total'] or 0
        
        return obj.stock - reservas_activas

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    class Meta:
        model = MovimientoInventario
        fields = '__all__'

class DetallePedidoSerializer(serializers.ModelSerializer):
    # NUEVO: Traemos el nombre del producto para el Frontend
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = DetallePedido
        # ACTUALIZADO: Añadimos 'producto_nombre' a los campos
        fields = ['producto', 'producto_nombre', 'cantidad', 'precio_unitario']

class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    
    # NUEVO: Traemos los datos legibles del cliente y la tienda para el Historial
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    cliente_direccion = serializers.ReadOnlyField(source='cliente.direccion')
    tienda_nombre = serializers.ReadOnlyField(source='tienda.nombre')

    class Meta:
        model = Pedido
        # ACTUALIZADO: Añadimos los nuevos campos a la lista
        fields = ['id', 'cliente', 'cliente_nombre', 'cliente_direccion', 'tienda', 'tienda_nombre', 'fecha_pedido', 'total', 'detalles']

    def create(self, validated_data):
        from django.db import transaction
        detalles_data = validated_data.pop('detalles')
        
        # Capturamos al usuario logueado desde el token
        usuario = self.context['request'].user if 'request' in self.context else None   
        
        with transaction.atomic():
            # Crear el pedido
            pedido = Pedido.objects.create(**validated_data)
            total_pedido = 0

            for detalle_data in detalles_data:
                producto = detalle_data['producto']
                cantidad = detalle_data['cantidad']
                
                # Validación atómica de stock (Punto 5)
                if producto.stock < cantidad:
                    raise serializers.ValidationError(f"Stock insuficiente para el producto {producto.nombre}. Stock actual: {producto.stock}")
                
                precio_unitario = producto.precio
                subtotal = cantidad * precio_unitario
                total_pedido += subtotal

                # Descontar stock (Esto activará el método save() para inhabilitar si llega a 0)
                producto.stock -= cantidad
                producto.save()

                # Crear detalle
                DetallePedido.objects.create(
                    pedido=pedido,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=precio_unitario
                )

                # Registrar trazabilidad de salida (Requisito 4)
                MovimientoInventario.objects.create(
                    producto=producto,
                    tipo_movimiento='SALIDA',
                    cantidad=cantidad,
                    motivo=f"Venta en Pedido #{pedido.id}",
                    usuario=usuario
                )

            pedido.total = total_pedido
            pedido.save()
            return pedido