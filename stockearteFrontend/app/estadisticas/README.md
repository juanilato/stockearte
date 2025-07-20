# Estadísticas - View

Este módulo muestra el dashboard de estadísticas de la empresa seleccionada, permitiendo visualizar métricas clave del negocio, analizar el inventario, ver gráficos de ventas y acceder a configuraciones personalizadas.

## Estructura General
- **Archivo principal:** `main.tsx`
- **Componentes:**
  - `EstadisticasHeader`: Header con acceso a configuración.
  - `EstadisticasCard`: Tarjetas para cada métrica clave.
  - `MetricasRendimiento`, `MetricasFinancieras`, `AnalisisInventario`: Secciones de métricas avanzadas.
  - `GraficoVentas`: Gráfico de ventas mensuales.
  - `ModalStockCritico`: Modal para productos con stock crítico.
  - `ModalConfiguracion`: Modal para personalizar qué métricas se muestran.
- **Hooks personalizados:**
  - `useEstadisticas`: Carga y gestiona las estadísticas principales.
  - `useGanancias`: Maneja el tipo de ganancia a mostrar (día, semana, mes).
  - `useVentasMensuales`: Carga datos para el gráfico de ventas.
  - `useMetricasAvanzadas`: Métricas financieras y de inventario avanzadas.
  - `useProductosCriticos`: Productos con stock crítico.
  - `useConfiguracionEstadisticas`: Preferencias de usuario para mostrar/ocultar métricas.

## Lógica Principal
1. **Carga de datos:**
   - Al seleccionar una empresa, se cargan estadísticas, ventas mensuales y métricas avanzadas.
   - Se usan animaciones para la entrada del dashboard.
2. **Renderizado condicional:**
   - Si no hay empresa seleccionada, se muestra un mensaje.
   - Si no hay datos, se invita a cargar productos o realizar ventas.
   - Si todo está cargado, se muestran las métricas y gráficos.
3. **Configuración:**
   - El usuario puede personalizar qué métricas ver desde el modal de configuración.
   - Las preferencias se guardan en el estado local (o podrían persistirse).
4. **Interacción:**
   - Al tocar la tarjeta de stock crítico, se abre un modal con los productos críticos.
   - El selector de ganancias permite alternar entre día, semana y mes.

## Extensión y Personalización
- Puedes agregar nuevas métricas creando un nuevo hook y componente, y añadiéndolo al renderizado condicional según la configuración.
- El diseño es responsivo y pensado para mobile-first.

## Dependencias
- React Native, Animated, Hooks personalizados, componentes propios del proyecto.

---

