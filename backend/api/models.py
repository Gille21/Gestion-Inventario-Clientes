from django.db import models

from django.contrib.auth.models import User
from django.utils import timezone
# ==========================================
# MÓDULO DE CLIENTES
# ==========================================
class Cliente(models.Model):
    identificacion = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=150, verbose_name="Nombre o Razón Social")
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20)
    direccion = models.TextField()
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.identificacion} - {self.nombre}"

# ==========================================
# MÓDULO DE TIENDAS
# ==========================================
class Tienda(models.Model):
    nombre = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=200)
    
    def __str__(self):
        return self.nombre

# ==========================================
# MÓDULO DE INVENTARIO
# ==========================================
class Producto(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.IntegerField(default=0)
    estado = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre

# ==========================================
# MOVIMIENTOS DE INVENTARIO
# ==========================================
class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SALIDA', 'Salida')
    ]
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_CHOICES)
    cantidad = models.IntegerField()
    motivo = models.CharField(max_length=200)
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.producto.nombre} ({self.cantidad})"

# ==========================================
# MÓDULO DE VENTAS Y BLOQUEO DE STOCK
# ==========================================
class ReservaStock(models.Model):

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    # Identificador de la sesión o cliente que está reservando
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    expira_en = models.DateTimeField()

    def esta_activa(self):
        return timezone.now() < self.expira_en

class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    tienda = models.ForeignKey(Tienda, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Pedido {self.id} - {self.cliente.nombre}"

class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio_unitario