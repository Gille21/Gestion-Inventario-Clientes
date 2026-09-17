from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import (
    Cliente,
    DetallePedido,
    MovimientoInventario,
    Pedido,
    Producto,
    Tienda,
)
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Puebla la base de datos con artículos de oficina y clientes iniciales'

    def crear_venta_demo(self, *, tienda, cliente, admin_user, productos, numero):
        motivo = f'Seed demo venta {numero}'
        if MovimientoInventario.objects.filter(motivo=motivo).exists():
            self.stdout.write(self.style.WARNING(f'La venta demo {numero} ya existe.'))
            return

        with transaction.atomic():
            pedido = Pedido.objects.create(tienda=tienda, cliente=cliente, total=0)
            total = 0

            for codigo, cantidad in productos:
                producto = Producto.objects.select_for_update().get(codigo=codigo)
                if producto.stock < cantidad:
                    raise ValueError(
                        f'Stock insuficiente para {producto.nombre}: '
                        f'se requieren {cantidad} y hay {producto.stock}.'
                    )

                DetallePedido.objects.create(
                    pedido=pedido,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario=producto.precio,
                )

                producto.stock -= cantidad
                producto.save()
                MovimientoInventario.objects.create(
                    producto=producto,
                    tipo_movimiento='SALIDA',
                    cantidad=cantidad,
                    motivo=motivo,
                    usuario=admin_user,
                )
                total += producto.precio * cantidad

            pedido.total = total
            pedido.save(update_fields=['total'])

        self.stdout.write(self.style.SUCCESS(f'Pedido demo #{pedido.id} creado.'))

    def handle(self, *args, **kwargs):

        # 0. Crear Tiendas
        tiendas = [
            {"nombre": "Pabellón Principal", "ubicacion": "Entrada 1 - Corferias"},
            {"nombre": "Stand Tecnológico", "ubicacion": "Pabellón 6 - Piso 2"},
        ]
        self.stdout.write("--- Registrando Tiendas ---")
        for t in tiendas:
            Tienda.objects.get_or_create(nombre=t['nombre'], defaults=t)
        # 1. Crear Productos
        productos = [
            {"codigo": "OFI-001", "nombre": "Resma de Papel A4", "descripcion": "Resma de 500 hojas de papel bond blanco, 75 gramos. Ideal para impresoras láser e inyección.", "categoria": "Papelería", "precio": 18500, "stock": 100, "estado": True},
            {"codigo": "OFI-002", "nombre": "Marcadores Borrables (Caja x4)", "descripcion": "Caja de 4 marcadores borrables para tablero (Rojo, Negro, Azul, Verde). Tinta de secado rápido.", "categoria": "Papelería", "precio": 12000, "stock": 50, "estado": True},
            {"codigo": "OFI-003", "nombre": "Silla Ergonómica Oficina", "descripcion": "Silla giratoria con soporte lumbar ajustable, brazos acolchados y malla transpirable color negro.", "categoria": "Mobiliario", "precio": 350000, "stock": 15, "estado": True},
            {"codigo": "OFI-004", "nombre": "Teclado Inalámbrico", "descripcion": "Teclado extendido con pad numérico, conexión Bluetooth y USB 2.4GHz. Batería de larga duración.", "categoria": "Tecnología", "precio": 85000, "stock": 25, "estado": True},
            {"codigo": "OFI-005", "nombre": "Cuaderno Argollado 100 hojas", "descripcion": "Cuaderno tamaño carta, pasta dura, argollado doble O. Hojas cuadriculadas con margen.", "categoria": "Papelería", "precio": 9000, "stock": 200, "estado": True},
        ]
        
        self.stdout.write("--- Registrando Productos ---")
        for p in productos:
            obj, created = Producto.objects.get_or_create(codigo=p['codigo'], defaults=p)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Producto creado: {p['nombre']}"))
            else:
                self.stdout.write(self.style.WARNING(f"El producto ya existe: {p['nombre']}"))

        # 2. Crear Clientes
        clientes = [
            {"identificacion": "900123456", "nombre": "Guillermo Licir", "correo": "guillermo@prueba.com", "telefono": "3112233445", "direccion": "calle 123 # 45-67"},
            {"identificacion": "1010202030", "nombre": "Juan Pruebas", "correo": "juan.pruebas@gmail.com", "telefono": "3112233445", "direccion": "calle 123 # 45-67"},
            {"identificacion": "901987654", "nombre": "Soluciones Tecnológicas Ltda", "correo": "ventas@soluciones.co", "telefono": "3112233445", "direccion": "calle 123 # 45-67"},
        ]

        # 3. Crear Superusuario por defecto
        self.stdout.write("\n--- Verificando Administrador ---")
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@corferias.com', 'Corferias123*')
            self.stdout.write(self.style.SUCCESS("Superusuario 'admin' creado exitosamente (Contraseña: Corferias123*)"))
        else:
            self.stdout.write(self.style.WARNING("El superusuario 'admin' ya existe."))

        self.stdout.write("\n--- Registrando Clientes ---")
        for c in clientes:
            obj, created = Cliente.objects.get_or_create(identificacion=c['identificacion'], defaults=c)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Cliente creado: {c['nombre']}"))
            else:
                self.stdout.write(self.style.WARNING(f"El cliente ya existe: {c['nombre']}"))

        tienda = Tienda.objects.get(nombre='Pabellón Principal')
        cliente1 = Cliente.objects.get(identificacion='900123456')
        cliente2 = Cliente.objects.get(identificacion='901987654')
        admin_user = User.objects.get(username='admin')

        self.stdout.write("\n--- Generando Ventas de Prueba ---")
        try:
            self.crear_venta_demo(
                tienda=tienda,
                cliente=cliente1,
                admin_user=admin_user,
                productos=[('OFI-001', 10), ('OFI-002', 5)],
                numero=1,
            )
            self.crear_venta_demo(
                tienda=tienda,
                cliente=cliente2,
                admin_user=admin_user,
                productos=[('OFI-003', 2), ('OFI-004', 3)],
                numero=2,
            )
        except (Producto.DoesNotExist, ValueError) as error:
            self.stdout.write(self.style.ERROR(f'No se generaron las ventas demo: {error}'))
        
        self.stdout.write(self.style.SUCCESS("\n¡Base de datos poblada exitosamente con productos y clientes!"))