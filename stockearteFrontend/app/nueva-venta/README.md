# Nueva Venta - View

Este módulo permite registrar nuevas ventas de manera rápida y eficiente, integrando escaneo de productos, selección de variantes, manejo de cantidades, integración con MercadoPago y feedback visual/sonoro.

## Estructura General
- **Archivo principal:** `main.tsx`
- **Componentes:**
  - `VentasHeader`: Header de la sección de ventas.
  - `ProductosDisponibles`: Lista de productos para seleccionar.
  - `ProductosSeleccionados`: Lista de productos agregados a la venta.
  - `ModalCantidad`: Selección de cantidad para un producto.
  - `ModalVariante`: Selección de variante de producto.
  - `ScannerModal`: Escaneo de códigos de barras.
  - `ModalApiKeyMercadoPago`: Configuración de la API Key de MercadoPago.
  - `ModalInterpretacionVoz`: Interpretación de voz para agregar productos.
  - `ModalTransferencia`, `ModalQRPago`: Métodos de pago.
  - `IndicadorGrabacion`, `mensajeFlotante`, `animacionGuardado`: Feedback visual y sonoro.
- **Hooks personalizados:**
  - `useProductos`: Maneja la obtención y filtrado de productos.
  - `useSeleccionados`: Maneja los productos seleccionados para la venta.
  - `useMensajeFlotante`: Feedback visual.
  - `useSonidos`: Feedback sonoro.
  - `useAnimacionGuardado`: Animación al guardar la venta.

## Lógica Principal
1. **Selección de productos:**
   - Se pueden buscar, escanear o seleccionar productos manualmente.
   - Se gestionan variantes y cantidades desde modales.
2. **Registro de venta:**
   - Al confirmar, se registra la venta en el backend y se muestra feedback visual/sonoro.
   - Se puede elegir el método de pago (efectivo, QR, transferencia).
3. **Integración con MercadoPago:**
   - Permite registrar pagos con QR o transferencia usando la API Key configurada.
4. **Feedback y accesibilidad:**
   - Animaciones, sonidos y mensajes flotantes para mejorar la experiencia.

## Extensión y Personalización
- Puedes agregar nuevos métodos de pago, animaciones o integraciones fácilmente extendiendo los hooks y componentes existentes.
- El diseño es mobile-first y pensado para uso rápido en punto de venta.

## Dependencias
- React Native, Expo Camera, Expo AV, Hooks personalizados, componentes propios del proyecto.

--- 