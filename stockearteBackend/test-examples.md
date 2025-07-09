# 🧪 Ejemplos de Testing - StockearteBackend API

## Configuración Inicial

### 1. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con tu configuración de Supabase.

### 2. Ejecutar setup

```bash
npm run setup
```

### 3. Iniciar servidor

```bash
npm run start:dev
```

## 🔐 Autenticación

### Crear Usuario

```bash
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stockearte.com",
    "password": "admin123",
    "nombreEmpresa": "Stockearte S.A."
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stockearte.com",
    "password": "admin123"
  }'
```

**Respuesta esperada:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@stockearte.com",
    "nombreEmpresa": "Stockearte S.A."
  }
}
```

### Verificar Token

```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

## 🏢 Empresas

### Crear Empresa

```bash
curl -X POST http://localhost:3000/api/company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU-JWT-TOKEN]" \
  -d '{
    "descripcion": "Empresa de tecnología y ventas",
    "usuarioId": 1
  }'
```

### Listar Empresas

```bash
curl -X GET http://localhost:3000/api/company \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

## 📦 Productos

### Crear Producto

```bash
curl -X POST http://localhost:3000/api/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU-JWT-TOKEN]" \
  -d '{
    "nombre": "Laptop Gaming",
    "precioCosto": 800.00,
    "precioVenta": 1200.00,
    "stock": 50,
    "codigoBarras": "LAPTOP001",
    "empresaId": 1
  }'
```

### Listar Productos

```bash
curl -X GET http://localhost:3000/api/product \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

### Obtener Producto por ID

```bash
curl -X GET http://localhost:3000/api/product/1 \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

### Actualizar Producto

```bash
curl -X PATCH http://localhost:3000/api/product/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU-JWT-TOKEN]" \
  -d '{
    "stock": 45,
    "precioVenta": 1150.00
  }'
```

## 🧱 Materiales

### Crear Material

```bash
curl -X POST http://localhost:3000/api/material \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU-JWT-TOKEN]" \
  -d '{
    "nombre": "Procesador Intel i7",
    "precioCosto": 300.00,
    "unidad": "unidad",
    "stock": 100,
    "empresaId": 1
  }'
```

### Listar Materiales

```bash
curl -X GET http://localhost:3000/api/material \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

## 💰 Ventas

### Crear Venta

```bash
curl -X POST http://localhost:3000/api/sale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU-JWT-TOKEN]" \
  -d '{
    "fecha": "2024-01-15T10:30:00Z",
    "totalProductos": 2,
    "precioTotal": 2400.00,
    "ganancia": 800.00,
    "empresaId": 1,
    "productos": [
      {
        "productoId": 1,
        "cantidad": 2,
        "precioUnitario": 1200.00,
        "ganancia": 400.00
      }
    ]
  }'
```

### Listar Ventas

```bash
curl -X GET http://localhost:3000/api/sale \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

### Obtener Venta por ID

```bash
curl -X GET http://localhost:3000/api/sale/1 \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

## 👥 Usuarios

### Listar Usuarios

```bash
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

### Obtener Usuario por ID

```bash
curl -X GET http://localhost:3000/api/user/1 \
  -H "Authorization: Bearer [TU-JWT-TOKEN]"
```

### Actualizar Usuario

```bash
curl -X PATCH http://localhost:3000/api/user/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU-JWT-TOKEN]" \
  -d '{
    "nombreEmpresa": "Stockearte S.A. - Actualizada"
  }'
```

## 🔍 Flujo Completo de Testing

### 1. Setup Inicial

```bash
# Crear usuario
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "nombreEmpresa": "Empresa Test"
  }'

# Login y obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

### 2. Crear Empresa

```bash
curl -X POST http://localhost:3000/api/company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "descripcion": "Empresa de testing",
    "usuarioId": 1
  }'
```

### 3. Crear Productos y Materiales

```bash
# Crear material
curl -X POST http://localhost:3000/api/material \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Material Test",
    "precioCosto": 50.00,
    "unidad": "kg",
    "stock": 100,
    "empresaId": 1
  }'

# Crear producto
curl -X POST http://localhost:3000/api/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Producto Test",
    "precioCosto": 100.00,
    "precioVenta": 150.00,
    "stock": 50,
    "empresaId": 1
  }'
```

### 4. Crear Venta

```bash
curl -X POST http://localhost:3000/api/sale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fecha": "2024-01-15T10:30:00Z",
    "totalProductos": 1,
    "precioTotal": 150.00,
    "ganancia": 50.00,
    "empresaId": 1,
    "productos": [
      {
        "productoId": 1,
        "cantidad": 1,
        "precioUnitario": 150.00,
        "ganancia": 50.00
      }
    ]
  }'
```

## 🛠️ Herramientas de Testing

### Postman Collection

Puedes importar estos requests a Postman para testing más fácil.

### Insomnia

También puedes usar Insomnia con los mismos endpoints.

### Script de Testing Automatizado

```bash
#!/bin/bash
# test-api.sh

BASE_URL="http://localhost:3000/api"

echo "🧪 Iniciando tests de API..."

# Crear usuario
echo "1. Creando usuario..."
USER_RESPONSE=$(curl -s -X POST $BASE_URL/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "nombreEmpresa": "Empresa Test"
  }')

echo "Usuario creado: $USER_RESPONSE"

# Login
echo "2. Haciendo login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Token obtenido: $TOKEN"

# Test endpoints protegidos
echo "3. Probando endpoints protegidos..."

# Listar productos
PRODUCTS_RESPONSE=$(curl -s -X GET $BASE_URL/product \
  -H "Authorization: Bearer $TOKEN")

echo "Productos: $PRODUCTS_RESPONSE"

echo "✅ Tests completados!"
```

## 📊 Monitoreo

### Health Check

```bash
curl -X GET http://localhost:3000/api
```

### Logs del Servidor

Los logs aparecerán en la consola donde ejecutes `npm run start:dev`.

### Prisma Studio

```bash
npm run db:studio
```

Esto abrirá una interfaz web para ver y editar la base de datos directamente.
