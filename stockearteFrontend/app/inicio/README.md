# Inicio - View

Este módulo es la pantalla principal del dashboard, mostrando un resumen del estado del negocio, accesos rápidos y métricas destacadas.

## Estructura General
- **Archivo principal:** `page.tsx`
- **Componentes:**
  - `HeaderIntegrado`: Header con usuario y empresa seleccionada.
  - `MetricasHoy`: Métricas destacadas del día.
  - `ModalEstadisticasDestacadas`: Modal con estadísticas ampliadas.
  - `ModalGestionProductos`: Gestión rápida de productos.
  - `ModalPreciosMateriales`: Gestión rápida de precios de materiales.
- **Hooks personalizados:**
  - `useProductos`: Obtención y sincronización de productos.
  - `useEmpresa`: Manejo de la empresa seleccionada.
  - `useEstadisticas`: Carga de estadísticas del negocio.
  - `useMateriales`: Carga de materiales.
  - `useAnimacionesInicio`: Animaciones de entrada y secciones.

## Lógica Principal
1. **Carga de datos:**
   - Al cargar la vista, se obtienen estadísticas, productos y materiales de la empresa seleccionada.
   - Se muestran animaciones de entrada para cada sección.
2. **Acciones rápidas:**
   - Acceso directo a nueva venta, estadísticas, productos y materiales.
   - Modales para gestión rápida sin salir del dashboard.
3. **Resumen y métricas:**
   - Se muestran métricas clave del día y un resumen rápido del negocio.
   - Si no hay empresa seleccionada, se invita a seleccionar o crear una.

## Extensión y Personalización
- Puedes agregar nuevas métricas, accesos rápidos o modales extendiendo los hooks y componentes existentes.
- El diseño es minimalista, moderno y mobile-first.

## Dependencias
- React Native, Animated, Hooks personalizados, componentes propios del proyecto.

--- 