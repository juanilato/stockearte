# Productos - View

Este módulo gestiona la visualización, creación, edición, filtrado y eliminación de productos de la empresa seleccionada. Permite además gestionar variantes, componentes, escanear códigos de barras y realizar operaciones masivas sobre los productos.

## Estructura General
- **Archivo principal:** `pages/main.tsx`
- **Componentes:**
  - `ProductosHeader`: Header de la sección de productos.
  - `ProductoItem`: Renderiza cada producto en la lista.
  - `ModalProducto`: Modal para crear/editar productos.
  - `ModalVariantes`: Gestión de variantes de producto.
  - `ModalComponentes`: Gestión de componentes de producto.
  - `ModalBarCode`: Visualización de código de barras.
  - `ModalScanner`: Escaneo de códigos de barras.
  - `ModalGestionProductos`: Operaciones masivas y gestión avanzada.
  - `CustomToast`: Mensajes de éxito/error.
  - `AIFloatingButton`: Acceso rápido a funciones inteligentes.
- **Hooks personalizados:**
  - `useProductos`: Maneja la obtención, filtrado y actualización de productos.
  - `useProductoActions`: Acciones CRUD optimistas sobre productos.

## Lógica Principal
1. **Carga y filtrado de productos:**
   - Se obtienen los productos de la empresa seleccionada usando el hook `useProductos`.
   - Se pueden filtrar por nombre, precio, stock, etc.
2. **Gestión de productos:**
   - Crear, editar y eliminar productos mediante modales.
   - Gestión de variantes y componentes desde los modales correspondientes.
   - Escaneo de códigos de barras para buscar/agregar productos.
3. **Operaciones masivas:**
   - Importar productos desde archivos.
   - Modificar precios de varios productos a la vez.
4. **Interacción y feedback:**
   - Mensajes de éxito/error mediante `CustomToast`.
   - Animaciones de entrada para mejorar la experiencia de usuario.

## Extensión y Personalización
- Puedes agregar nuevos filtros, columnas o acciones masivas fácilmente extendiendo los hooks y componentes existentes.
- El diseño es responsivo y pensado para mobile-first.

## Dependencias
- React Native, Animated, Expo Document Picker, Hooks personalizados, componentes propios del proyecto.

--- 