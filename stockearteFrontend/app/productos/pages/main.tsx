// productos/views/ProductosView.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  Text, View, Modal, TouchableOpacity
} from 'react-native';
import ModernLoading from '../../../components/ModernLoading';

// Importar los nuevos hooks y tipos del backend
import { 
  useProductos, 
  useProductoActions,  
  ToastType 
} from '../hooks';
import { Producto, VarianteProducto } from '../../../services/api';
import { useEmpresa } from '../../../context/EmpresaContext';
import { commonStyles } from '../../styles/theme';


import ModalConfirmacion from '@/components/ModalConfirmacion';

import CustomToast from '../../../components/CustomToast';

import ModalBarCode from '../components/ModalBarCode';
import ModalComponentes from '../components/ModalComponentes';
import ModalProducto from '../components/ModalProducto';
import ModalScanner from '../components/ModalScanner';
import ModalVariantes from '../components/ModalVariantes';
import ProductoItem from '../components/ProductoItem';
import ProductosHeader from '../components/ProductosHeader';
import BarcodeSVG from '../components/BarcodeSVG';

// Importar funciones separadas
import ModalGestionProductos from '../components/ModalGestionProductos';
import AIFloatingButton from '@/components/AIFloatingButton';
import { interpretarArchivo } from '../../../config/backend';

export default function ProductosView() {
  // Usar el contexto de empresa
  const { selectedEmpresa, loading: empresaLoading } = useEmpresa();
  

  
  // Estados de UI
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null); // Producto seleccionado para editar 
  const [modalProductoVisible, setModalProductoVisible] = useState(false); // Modal Para crear/editar producto
  const [modalVariantesVisible, setModalVariantesVisible] = useState(false); // Modal para gestionar variantes de producto
  const [modalBarcodeVisible, setModalBarcodeVisible] = useState(false); // Modal para mostrar código de barras
  const [barcodeData] = useState(''); // Datos del código de barras a mostrar en el modal
  const [modalComponentesVisible, setModalComponentesVisible] = useState(false); // Modal para gestionar componentes de producto
  const [menuVisible] = useState(false); 
  
  const [varianteSeleccionada] = useState<VarianteProducto | null>(null); // Variante seleccionada para generar código de barras
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);  // setter de producto a eliminar
  const [scannerVisible, setScannerVisible] = useState(false); // Scanner visible para escanear códigos de barras
  const [toast, setToast] = useState<ToastType | null>(null); // Toast para mostrar mensajes de éxito o error
  const [productoPriceVisible, setProductoPriceVisible] = useState(false); // Modal para mostrar precios de los productos

  // Estados para el modal de código de barras
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState<string | null>(null);
  const [barcodeLabel, setBarcodeLabel] = useState<string>('');
  const [barcodeVarianteOptions, setBarcodeVarianteOptions] = useState<VarianteProducto[] | null>(null);
  const [barcodeProducto, setBarcodeProducto] = useState<Producto | null>(null);

  // Estados para los filtros
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [costoDesde, setCostoDesde] = useState('');
  const [costoHasta, setCostoHasta] = useState('');
  const [ventaDesde, setVentaDesde] = useState('');
  const [ventaHasta, setVentaHasta] = useState('');
  const [stockDesde, setStockDesde] = useState('');
  const [stockHasta, setStockHasta] = useState('');
  const [filtrosExpanded, setFiltrosExpanded] = useState(false);
  
  // Estados para archivos
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  const [productosPrecargados, setProductosPrecargados] = useState<any[]>([]);
  const [backendProductos, setBackendProductos] = useState<any[] | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Hooks para manejar productos
  // 
  const { 
    productos,  // Lista de productos obtenidos del backend
    loading: productosLoading, // Estado de carga de productos
    filtrarProductos, // Función para filtrar productos
    cargarProductos, // Función para cargar productos desde el backend
    crearProductoOptimista,
    actualizarProductoOptimista,
    eliminarProducto
  } = useProductos({ 
    empresaId: selectedEmpresa?.id, // ID de la empresa seleccionada para getear sus productos
    onError: (error) => setToast({ type: 'error', message: error })  
  });

  const { 
    manejarGuardarProducto, 
    manejarEliminarProducto 
  } = useProductoActions({ 
    crearProductoOptimista,
    actualizarProductoOptimista,
    eliminarProducto,
    cargarProductos,
    empresaId: selectedEmpresa?.id 
  });


  // Inicialización
  useEffect(() => {
    if (selectedEmpresa?.id) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    }
  }, [selectedEmpresa, fadeAnim]);

  

  // Manejo de guardado de producto, recibe data y si es nuevo o no
  // Si es nuevo, se crea un nuevo producto, si no, se edita el existente
  // Luego cierra el modal de producto
  const handleGuardarProducto = async (producto: Producto, esNuevo: boolean) => {
    await manejarGuardarProducto(producto, esNuevo, setToast);
    setModalProductoVisible(false);
  };

  // Manejo de eliminacion de producto, lo selecciona y muestra modal de confirmacion
  const handleEliminarProducto = (id: number) => {
    const producto = productos.find((p) => p.id === id);
    if (producto) {
      setProductoAEliminar(producto);
    }
  };

  // Confirmar eliminación de producto 
  const confirmarEliminacion = async () => {
    if (productoAEliminar?.id) {
      await manejarEliminarProducto(productoAEliminar.id, setToast, setProductoAEliminar);
    }
  };

  // Setea el scanner en visible 
  const handleScan = () => {
    setScannerVisible(true);
    setFiltrosExpanded(false);
  };


  // Setea el modal de precios en visible (modificacion de varios productos a la vez)
  const handlePriceChange = () => {
    setProductoPriceVisible(true);
  };

  // Creacion de nuevo producto 
  const handleAgregarProducto = () => {
    if (!selectedEmpresa) {
      setToast({ type: 'error', message: 'Debes seleccionar una empresa primero' });
      return;
    }
    setProductoSeleccionado(null);
    setModalProductoVisible(true);
    setFiltrosExpanded(false);
  };
  
  // Filtrar productos usando el hook
  const productosFiltrados = useMemo(() => {
    return filtrarProductos({
      nombre: nombreFiltro || undefined,
      costoDesde: costoDesde ? parseFloat(costoDesde) : undefined,
      costoHasta: costoHasta ? parseFloat(costoHasta) : undefined,
      ventaDesde: ventaDesde ? parseFloat(ventaDesde) : undefined,
      ventaHasta: ventaHasta ? parseFloat(ventaHasta) : undefined,
      stockDesde: stockDesde ? parseInt(stockDesde, 10) : undefined,
      stockHasta: stockHasta ? parseInt(stockHasta, 10) : undefined,
    });
  }, [nombreFiltro, costoDesde, costoHasta, ventaDesde, ventaHasta, stockDesde, stockHasta, filtrarProductos]);




  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/pdf', // .pdf
          'application/vnd.google-apps.document', // Google Docs
          'application/vnd.google-apps.spreadsheet', // Google Sheets
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setUploadResult(null);
        uploadFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

    const uploadFile = async (file: DocumentPicker.DocumentPickerAsset) => {
    if (!file.uri) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const data = await interpretarArchivo({
        uri: file.uri,
        name: file.name || 'document',
        type: file.mimeType || 'application/octet-stream',
      });
      
      console.log('Respuesta del backend:', data);
      if (data && data.error) {
        setUploadResult('No se pudo interpretar el archivo');
        return;
      }
      // Validar que la respuesta sea un array de objetos con los campos requeridos
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && (data[0].nombre || data[0].precioVenta || data[0].precioCosto)) {
        setBackendProductos(data);
      } else if (Array.isArray(data) && typeof data[0] === 'string') {
        // Si la IA devolvió solo nombres, transformar a objetos vacíos
        const productosTransformados = data.map(nombre => ({ nombre, precioVenta: null, precioCosto: null, stock: null }));
        setBackendProductos(productosTransformados);
      } else if (data && data.tipo === 'factura') {
        setUploadResult('Factura interpretada. Pronto se abrirá el modal de venta.');
        Alert.alert('Factura detectada', 'Se detectó una factura. Pronto se abrirá el modal de precarga de venta editable.');
      } else {
        setUploadResult('No se pudo interpretar el archivo');
        console.error('Respuesta inesperada del backend:', data);
      }
    } catch (error) {
      setUploadResult('Error al interpretar el archivo');
      console.error('Error al interpretar archivo:', error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (backendProductos && Array.isArray(backendProductos) && backendProductos.length > 0) {
      const productosConBarra = backendProductos
        .filter(Boolean)
        .map((prod, idx) => ({
          ...prod,
          id: prod.id ?? `temp-${Date.now()}-${idx}`,
          codigoBarras: prod.codigoBarras ?? undefined,
          stock: prod.stock == null ? 0 : prod.stock,
        }));
      setProductosPrecargados(productosConBarra);
      setModalProductosVisible(true);
    }
  }, [backendProductos]);

  // Limpiar productosPrecargados y backendProductos al cerrar el modal
  useEffect(() => {
    if (!modalProductosVisible) {
      setProductosPrecargados([]);
      setBackendProductos(null);
    }
  }, [modalProductosVisible]);

  // Mostrar loading cuando se están cargando productos o empresa
  if (productosLoading || empresaLoading) {
    return <ModernLoading type="productos" />;
  }

  const handleShowBarcode = (producto: Producto) => {
    if (producto.variantes && producto.variantes.length > 0) {
      setBarcodeVarianteOptions(producto.variantes);
      setBarcodeProducto(producto);
      setBarcodeModalVisible(true);
      setBarcodeValue(null);
      setBarcodeLabel('');
    } else {
      setBarcodeValue(producto.codigoBarras || '');
      setBarcodeLabel(producto.nombre);
      setBarcodeModalVisible(true);
      setBarcodeVarianteOptions(null);
      setBarcodeProducto(null);
    }
  };

  return (
    <>
    {/*Productos Header:
        nombre de los filtros, inputs para filtrar, botón de agregar producto,
        botón de escanear, botón de precios, cantidad de productos, setter de filtrosExpanded
      */}
      <ProductosHeader
        nombre={nombreFiltro}
        setNombre={setNombreFiltro}
        precioCostoDesde={costoDesde}
        setPrecioCostoDesde={setCostoDesde}
        precioCostoHasta={costoHasta}
        setPrecioCostoHasta={setCostoHasta}
        precioVentaDesde={ventaDesde}
        setPrecioVentaDesde={setVentaDesde}
        precioVentaHasta={ventaHasta}
        setPrecioVentaHasta={setVentaHasta}
        stockDesde={stockDesde}
        setStockDesde={setStockDesde}
        stockHasta={stockHasta}
        setStockHasta={setStockHasta}
        onAgregar={handleAgregarProducto}
        onScan={handleScan}
        onPrice={handlePriceChange}
        cantidad={productos.length}
        isExpanded={filtrosExpanded}
        setExpanded={setFiltrosExpanded}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <Pressable onPress={() => filtrosExpanded && setFiltrosExpanded(false)} style={{ flex: 1}}>
          {/* Lista de productos filtrados :
            Botones de editar, eliminar, componentes y variantes,
          */}
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id?.toString() || ''}
            renderItem={({ item }) => (
              <ProductoItem
                producto={item}
                onEdit={(prod) => {
                  setProductoSeleccionado(prod);
                  setModalProductoVisible(true);
                }}
                onDelete={(prod) => handleEliminarProducto(prod.id!)}
                onComponentes={(prod) => {
                  setProductoSeleccionado(prod);
                  setModalComponentesVisible(true);
                }}
                onVariantes={(prod) => {
                  setProductoSeleccionado(prod);
                  setModalVariantesVisible(true);
                }}
                onShowBarcode={handleShowBarcode}
              />
            )}
            ListEmptyComponent={
              <View style={commonStyles.emptyState}>
                <MaterialCommunityIcons name="package-variant-closed" size={64} color="#94a3b8" />
                <Text style={commonStyles.emptyStateText}>No se encontraron productos</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
          />
        </Pressable>

        {/* MODALES */}
        {/* Modal para editar producto o crear producto */}
        <ModalProducto
          visible={modalProductoVisible}
          onClose={() => setModalProductoVisible(false)}
          onSubmit={handleGuardarProducto}
          productoEditado={productoSeleccionado}
        />
        {/* Modal para gestionar precios de productos varios a la vez*/}
        <ModalGestionProductos
          visible={productoPriceVisible}
          productosPrecargados={productos}
          onClose={() => setProductoPriceVisible(false)}
        />
        {/* Modal para gestionar productos precargados desde archivo */}
        <ModalGestionProductos
          visible={modalProductosVisible}
          onClose={() => setModalProductosVisible(false)}
          productosPrecargados={productosPrecargados}
          onConfirmarPrecarga={async (productosEditados: any[]) => {
            console.log('Intentando guardar productos precargados:', productosEditados);
            try {
              interface ProductoPrecargado {
                id?: string | number;
                nombre?: string;
                precioCosto?: number | string | null;
                precioVenta?: number | string | null;
                stock?: number | string | null;
                codigoBarras?: string | number | null;
                [key: string]: any;
              }

              interface ProductoSanitizado {
                nombre: string;
                precioCosto: number;
                precioVenta: number;
                stock: number;
                codigoBarras?: string;
              }

              const productosSanitizados: ProductoSanitizado[] = (productosEditados as ProductoPrecargado[]).map((producto: ProductoPrecargado): ProductoSanitizado => {
                if (typeof producto.id === 'string' && (producto.id as string).startsWith('temp-')) {
                  const { id, ...rest } = producto;
                  producto = { ...rest };
                }
                // Sanitizar campos
                return {
                  nombre: String(producto.nombre ?? ''),
                  precioCosto: Number(producto.precioCosto ?? 0),
                  precioVenta: Number(producto.precioVenta ?? 0),
                  stock: Number(producto.stock ?? 0),
                  codigoBarras: producto.codigoBarras ? String(producto.codigoBarras) : undefined,
                };
              });

              if (productosSanitizados.length === 0) {
                setToast({ message: 'No hay productos para importar', type: 'warning' });
                return;
              }
              for (let producto of productosSanitizados) {
                // Por cada producto, guardar en back 
                await manejarGuardarProducto(producto, true, setToast);
              
              }
              // Una vez guardados todos los productos, recargar la lista
              await cargarProductos();
              setToast({ message: 'Productos importados correctamente', type: 'success' });
              setModalProductosVisible(false);
            } catch (error) {
              console.error('Error al importar productos:', error);
              setToast({ message: 'Error al importar productos', type: 'error' });
              // No cierres el modal si hay error
            }
          }}
          
        />
          {/* Modal para gestionar variantes de un producto */}
        {modalVariantesVisible && productoSeleccionado && (

          <ModalVariantes
            visible={modalVariantesVisible}
            onClose={() => setModalVariantesVisible(false)}
            producto={productoSeleccionado}
            onActualizar={cargarProductos}
          />
        )}
        {/* Modal para escanear códigos de barras */}
        <ModalScanner
          visible={scannerVisible}
          productos={productos}
          onClose={() => setScannerVisible(false)}
          onSubmit={handleGuardarProducto}
        />
        {/* Modal para mostrar código de barras */}
        <ModalBarCode
          visible={modalBarcodeVisible}
          onClose={() => setModalBarcodeVisible(false)}
          barcodeData={barcodeData}
          producto={productoSeleccionado!}
          variante={varianteSeleccionada}
        />
        {/* Modal para gestionar componentes de un producto */}
        {modalComponentesVisible && productoSeleccionado && (
          <ModalComponentes
            visible={modalComponentesVisible}
            onClose={() => {
              setModalComponentesVisible(false);
              setTimeout(() => setProductoSeleccionado(null), 100);
            }}
            producto={productoSeleccionado}
            onActualizar={cargarProductos}
          />
        )}


        {/* Toast de resultado arriba */}
        {uploadResult && (
          <View style={{ position: 'absolute', top: 30, left: 20, right: 20, zIndex: 10, alignItems: 'center' }}>
            <Text style={{
              backgroundColor: uploadResult.startsWith('Error') ? '#fee2e2' : uploadResult.includes('Factura') ? '#fef9c3' : '#d1fae5',
              color: uploadResult.startsWith('Error') ? '#b91c1c' : uploadResult.includes('Factura') ? '#b45309' : '#065f46',
              padding: 12,
              borderRadius: 8,
              fontWeight: '600',
              fontSize: 16,
              textAlign: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}>
              {uploadResult}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Toast */}
      {toast && !modalProductoVisible && !modalVariantesVisible && !modalBarcodeVisible && !modalComponentesVisible && !menuVisible && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal de confirmación */}
      <ModalConfirmacion
        visible={!!productoAEliminar}
        mensaje={`¿Deseas eliminar el producto "${productoAEliminar?.nombre}"?`}
        onCancelar={() => setProductoAEliminar(null)}
        onConfirmar={confirmarEliminacion}
      />

      {/* Botón de IA */}
      <AIFloatingButton
        onPress={handlePickDocument}
        disabled={uploading}
        description="Subir documento para interpretar productos"
        variant="question"
        isActive={uploading}
        buttonColor={uploading ? '#fde047' : undefined}
        robotColor={uploading ? '#b45309' : undefined}
      />

      {/* MODAL DE CÓDIGO DE BARRAS */}
      {barcodeModalVisible && (
        <Modal
          visible={barcodeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setBarcodeModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 320 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Código de Barras</Text>
              {barcodeVarianteOptions && barcodeProducto ? (
                <>
                  <Text style={{ marginBottom: 8 }}>Seleccioná una variante:</Text>
                  {barcodeVarianteOptions.map((variante) => (
                    <TouchableOpacity
                      key={variante.id}
                      style={{ padding: 8, marginVertical: 4, backgroundColor: '#f1f5f9', borderRadius: 8, width: 200, alignItems: 'center' }}
                      onPress={() => {
                        setBarcodeValue(variante.codigoBarras || '');
                        setBarcodeLabel(barcodeProducto.nombre + ' - ' + variante.nombre);
                      }}
                    >
                      <Text>{variante.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : null}
              {barcodeValue ? (
                <>
                  <Text style={{ marginVertical: 8 }}>{barcodeLabel}</Text>
                  <BarcodeSVG value={barcodeValue} />
                </>
              ) : null}
              <TouchableOpacity
                style={{ marginTop: 16, padding: 10, backgroundColor: '#e2e8f0', borderRadius: 8 }}
                onPress={() => setBarcodeModalVisible(false)}
              >
                <Text style={{ color: '#334155', fontWeight: 'bold' }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
