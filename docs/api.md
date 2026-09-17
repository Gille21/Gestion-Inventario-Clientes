# Documentación de la API - ERP Corferias

La API está desarrollada bajo el estándar RESTful utilizando Django REST Framework.

## Autenticación

La aplicación utiliza tokens JWT:

- `POST /api/token/`: obtiene los tokens de acceso y renovación.
- `POST /api/token/refresh/`: renueva el token de acceso.

Incluye el token de acceso como `Bearer` en el encabezado `Authorization`.

## Endpoints Principales

### 1. Clientes

- Ruta: `/api/clientes/`
- Métodos: `GET`, `POST`, `PUT`, `PATCH` y `DELETE`.
- Descripción: administra los clientes activos del sistema.

### 2. Productos / Inventario

- Ruta: `/api/productos/`
- Métodos: `GET`, `POST`, `PUT`, `PATCH` y `DELETE`.
- Descripción: consulta y administra materiales, categorías, precios y stock real.
- Ejemplo de body JSON:

```json
{
  "codigo": "MAT-006",
  "nombre": "Marcadores Permanente",
  "descripcion": "Caja x12 negro",
  "categoria": "Papelería",
  "precio": 15000,
  "stock": 50
}
```

### 3. Abastecimiento de Inventario

- Ruta: `/api/productos/{id}/abastecer/`
- Método: `POST`
- Descripción: registra una entrada en el Kardex y actualiza el stock.
- Ejemplo de body JSON:

```json
{
  "cantidad": 20,
  "motivo": "Compra a proveedor"
}
```

### 4. Movimientos de Inventario

- Ruta: `/api/movimientos/`
- Método: `GET`
- Descripción: consulta entradas y salidas del Kardex. Admite filtros por producto y fechas.

### 5. Pedidos / Transacciones Comerciales

- Ruta: `/api/pedidos/`
- Métodos: `GET` y `POST`.
- `GET`: retorna el historial de transacciones, sus productos, tienda y cliente.
- `POST`: registra una venta, descuenta automáticamente el stock y genera el movimiento de salida en el Kardex.

Ejemplo simplificado de body JSON:

```json
{
  "cliente": 1,
  "tienda": 1,
  "detalles": [
    {
      "producto": 1,
      "cantidad": 2,
      "precio_unitario": 18500
    }
  ]
}
```

## Documentación interactiva

Con el backend en ejecución, Swagger está disponible en `/swagger/`.
