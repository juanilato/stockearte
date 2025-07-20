# Materiales - View

Este módulo permite gestionar los materiales de la empresa, incluyendo su visualización, edición, actualización de precios y stock, y gestión de variantes.

## Estructura General
- **Archivo principal:** `main.tsx`
- **Componentes:**
  - `MaterialesHeader`: Header de la sección de materiales.
  - `MaterialItem`: Renderiza cada material en la lista.
  - `ModalMaterial`: Modal para crear/editar materiales.
  - `ModalPreciosMateriales`: Actualización masiva de precios.
- **Hooks personalizados:**
  - `useMateriales`: Obtención y filtrado de materiales.
  - `useActualizacionPrecios`: Actualización masiva de precios.
  - `useModalMaterial`: Manejo del modal de materiales.
  - `useAnimaciones`: Animaciones de entrada.

## Lógica Principal
1. **Carga y filtrado de materiales:**
   - Se obtienen los materiales de la empresa seleccionada usando el hook `useMateriales`.
   - Se pueden filtrar y buscar materiales por nombre, categoría, etc.
2. **Gestión de materiales:**
   - Crear, editar y eliminar materiales mediante modales.
   - Actualización masiva de precios desde el modal correspondiente.
3. **Interacción y feedback:**
   - Mensajes de éxito/error y animaciones para mejorar la experiencia de usuario.

## Extensión y Personalización
- Puedes agregar nuevas categorías, campos o acciones masivas fácilmente extendiendo los hooks y componentes existentes.
- El diseño es mobile-first y pensado para gestión rápida.

## Dependencias
- React Native, Hooks personalizados, componentes propios del proyecto.

--- 