from django.core.management.base import BaseCommand
from api.models import Producto, Cliente

class Command(BaseCommand):
    help = 'Puebla la base de datos con artículos de oficina y clientes iniciales'

    def handle(self, *args, **kwargs):
        # 1. Crear Productos
        productos = [
            {"codigo": "OFI-001", "nombre": "Resma de Papel A4", "categoria": "Papelería", "precio": 18500, "stock_actual": 100},
            {"codigo": "OFI-002", "nombre": "Marcadores Borrables (Caja x4)", "categoria": "Papelería", "precio": 12000, "stock_actual": 50},
            {"codigo": "OFI-003", "nombre": "Silla Ergonómica Oficina", "categoria": "Mobiliario", "precio": 350000, "stock_actual": 15},
            {"codigo": "OFI-004", "nombre": "Teclado Inalámbrico", "categoria": "Tecnología", "precio": 85000, "stock_actual": 25},
            {"codigo": "OFI-005", "nombre": "Cuaderno Argollado 100 hojas", "categoria": "Papelería", "precio": 9000, "stock_actual": 200},
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

        self.stdout.write("\n--- Registrando Clientes ---")
        for c in clientes:
            obj, created = Cliente.objects.get_or_create(identificacion=c['identificacion'], defaults=c)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Cliente creado: {c['nombre']}"))
            else:
                self.stdout.write(self.style.WARNING(f"El cliente ya existe: {c['nombre']}"))
        
        self.stdout.write(self.style.SUCCESS("\n¡Base de datos poblada exitosamente con productos y clientes!"))