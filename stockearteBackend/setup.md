# 🚀 Setup de StockearteBackend

## 1. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Database Configuration (Supabase)
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.cfpuhteaijbvetbcjhea.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[TU-PASSWORD]@db.cfpuhteaijbvetbcjhea.supabase.co:5432/postgres"

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu-super-secret-jwt-key-cambia-esto-en-produccion
JWT_EXPIRES_IN=24h

# API Configuration
API_PREFIX=api
```

**⚠️ IMPORTANTE:** Reemplaza `[TU-PASSWORD]` con tu contraseña real de Supabase.

## 2. Instalación de Dependencias

```bash
npm install
```

## 3. Configuración de la Base de Datos

### Generar el cliente de Prisma:

```bash
npx prisma generate
```

### Ejecutar las migraciones:

```bash
npx prisma migrate dev --name init
```

### (Opcional) Ver la base de datos:

```bash
npx prisma studio
```

## 4. Ejecutar el Proyecto

### Modo desarrollo (con hot reload):

```bash
npm run start:dev
```

### Modo producción:

```bash
npm run build
npm run start:prod
```

## 5. Verificar que Funciona

El servidor estará disponible en: `http://localhost:3000`

### Endpoints disponibles:

- **Auth:**
  - `POST /auth/login` - Login tradicional
  - `POST /auth/social-login` - Login social
  - `GET /auth/profile` - Perfil del usuario (requiere JWT)
  - `GET /auth/verify` - Verificar token (requiere JWT)

- **Users:**
  - `GET /user` - Listar usuarios
  - `POST /user` - Crear usuario
  - `GET /user/:id` - Obtener usuario
  - `PATCH /user/:id` - Actualizar usuario
  - `DELETE /user/:id` - Eliminar usuario

- **Products:**
  - `GET /product` - Listar productos
  - `POST /product` - Crear producto
  - `GET /product/:id` - Obtener producto
  - `PATCH /product/:id` - Actualizar producto
  - `DELETE /product/:id` - Eliminar producto

- **Materials:**
  - `GET /material` - Listar materiales
  - `POST /material` - Crear material
  - `GET /material/:id` - Obtener material
  - `PATCH /material/:id` - Actualizar material
  - `DELETE /material/:id` - Eliminar material

- **Sales:**
  - `GET /sale` - Listar ventas
  - `POST /sale` - Crear venta
  - `GET /sale/:id` - Obtener venta
  - `PATCH /sale/:id` - Actualizar venta
  - `DELETE /sale/:id` - Eliminar venta

- **Companies:**
  - `GET /company` - Listar empresas
  - `POST /company` - Crear empresa
  - `GET /company/:id` - Obtener empresa
  - `PATCH /company/:id` - Actualizar empresa
  - `DELETE /company/:id` - Eliminar empresa

## 6. Testing de Funcionalidades

### Crear un usuario de prueba:

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nombreEmpresa": "Empresa Test"
  }'
```

### Hacer login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Crear un producto (con token JWT):

```bash
curl -X POST http://localhost:3000/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU-JWT-TOKEN]" \
  -d '{
    "nombre": "Producto Test",
    "precioCosto": 10.50,
    "precioVenta": 15.00,
    "stock": 100,
    "codigoBarras": "123456789"
  }'
```

## 7. Troubleshooting

### Si hay problemas con la base de datos:

1. Verifica que las credenciales de Supabase sean correctas
2. Asegúrate de que la base de datos esté activa en Supabase
3. Ejecuta `npx prisma db push` para sincronizar el schema

### Si hay problemas con JWT:

1. Verifica que JWT_SECRET esté configurado en el .env
2. Asegúrate de que el token no haya expirado

### Si hay problemas de CORS:

- Por ahora el CORS no está configurado, pero puedes agregarlo en `main.ts` si es necesario
