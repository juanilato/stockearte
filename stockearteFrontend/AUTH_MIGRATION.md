# Migración de Autenticación: Clerk → Backend Personalizado

## Resumen de Cambios

Se ha migrado el sistema de autenticación de Clerk a un backend personalizado basado en NestJS con JWT.

## Archivos Modificados

### Frontend

1. **`services/auth.ts`** - Nuevo servicio de autenticación
   - Maneja login, registro, verificación de token
   - Integración con AsyncStorage para persistencia
   - Interceptores de axios para manejo automático de tokens

2. **`context/AuthContext.tsx`** - Nuevo contexto de autenticación
   - Estado global de autenticación
   - Funciones de login, registro y logout
   - Verificación automática de autenticación

3. **`app/_layout.tsx`** - Layout principal actualizado
   - Reemplazado ClerkProvider con AuthProvider
   - Navegación basada en estado de autenticación

4. **`app/login.tsx`** - Pantalla de login actualizada
   - Integración con nuevo servicio de autenticación
   - Mantiene funcionalidad de biometría
   - Preparado para login social (pendiente implementación)

5. **`app/signup.tsx`** - Pantalla de registro actualizada
   - Validación de contraseñas
   - Integración con nuevo servicio de autenticación
   - Preparado para registro social (pendiente implementación)

6. **`app/VincularSociales.tsx`** - Componente actualizado
   - Reemplazado useUser de Clerk con nuestro contexto
   - Preparado para vinculación social (pendiente implementación)

7. **`app/nueva-venta/main.tsx`** - Pantalla de ventas actualizada
   - Reemplazado useUser de Clerk con nuestro contexto
   - Funcionalidad de API key temporalmente comentada

8. **`app/components/InicioView.tsx`** - Vista principal actualizada
   - Reemplazado useUser y useClerk de Clerk con nuestro contexto
   - Funcionalidades de perfil temporalmente comentadas

9. **`config/backend.ts`** - Configuración actualizada
   - URL del backend actualizada a puerto 3000 con ruta /api
   - Endpoints de autenticación agregados
   - Configuración centralizada

### Backend

1. **`src/user/user.controller.ts`** - Controlador de usuario actualizado
   - Endpoint de creación devuelve token JWT
   - Integración con JwtService

2. **`src/user/user.module.ts`** - Módulo de usuario actualizado
   - Importación de JwtModule y PrismaModule
   - Configuración de JWT

## Funcionalidades Implementadas

### ✅ Completadas
- Login con email/password
- Registro de usuarios
- Verificación de token JWT
- Persistencia de sesión con AsyncStorage
- Navegación automática basada en autenticación
- Integración con biometría existente
- Manejo de errores de autenticación
- Eliminación completa de dependencias de Clerk

### 🔄 Pendientes
- Login social (Google, Apple)
- Verificación de email
- Recuperación de contraseña
- Actualización de perfil de usuario
- Almacenamiento de API keys de MercadoPago
- Cambio de contraseña

## Configuración Requerida

### Variables de Entorno (Backend)
```env
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

### Dependencias Instaladas
```bash
# Frontend
npm install @react-native-async-storage/async-storage

# Backend (ya incluidas)
@nestjs/jwt
bcryptjs
```

## Uso

### Login
```typescript
const { login } = useAuth();
await login(email, password);
```

### Registro
```typescript
const { register } = useAuth();
await register(email, password);
```

### Verificar Autenticación
```typescript
const { isAuthenticated, user } = useAuth();
```

### Logout
```typescript
const { logout } = useAuth();
await logout();
```

## Endpoints del Backend

- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/social-login` - Login social
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/user` - Crear usuario

## Notas Importantes

1. **URL del Backend**: Configurada en `config/backend.ts` como `http://192.168.100.100:3000/api`
2. **Tokens JWT**: Expiran en 24 horas
3. **Biometría**: Mantiene compatibilidad con el sistema existente
4. **AsyncStorage**: Usado para persistencia local de tokens y datos de usuario
5. **Clerk**: Completamente eliminado del proyecto

## Funcionalidades Temporalmente Deshabilitadas

- Actualización de nombre de usuario
- Cambio de contraseña
- Almacenamiento de API keys de MercadoPago
- Vinculación de redes sociales

## Próximos Pasos

1. Implementar login social con Google/Apple
2. Agregar verificación de email
3. Implementar recuperación de contraseña
4. Implementar actualización de perfil de usuario
5. Implementar almacenamiento de API keys
6. Mejorar manejo de errores
7. Agregar tests unitarios 