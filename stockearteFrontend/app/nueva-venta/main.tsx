import { useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
// @ts-ignore
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AIFloatingButton from '../components/AIFloatingButton';
import ModernLoading from '../components/ModernLoading';
import { productoService, saleService, Producto, VarianteProducto } from '../../services/api';
import { colors, spacing } from '../../styles/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useEmpresa } from '../../context/EmpresaContext';
import ModalApiKeyMercadoPago from './components/ModalApiKeyMercadoPago';
import ModalCantidad from './components/modalCantidad';
import ModalInterpretacionVoz from './components/ModalInterpretacionVoz';
import ModalVariante from './components/modalVariante';
import ProductosDisponibles from './components/productosDisponibles';
import ProductosSeleccionados from './components/productosSeleccionados';
import ScannerModal from './components/scannerModal';
import VentasHeader from './components/VentasHeader';
import { useMensajeFlotante } from './hooks/useMensajeFlotante';
import { useProductos } from './hooks/useProductos';
import { useSeleccionados } from './hooks/useSeleccionados';
import { useSonidos } from './hooks/useSonidos';

// Elimino la API Key y funciones de AssemblyAI
// const ASSEMBLYAI_API_KEY = 'f25169eacdf54ff0955289f5dd43568f'; // <-- REEMPLAZA AQUÍ
// import { interpretarVoz } from '../../config/backend';

// Nueva función para transcribir usando el backend local
// Cambia esta IP si usas emulador/dispositivo físico
const BASE_URL = 'http://192.168.100.10:3000/api/ia'; // <-- Ahora apunta al backend principal

const transcribeAudioWithBackend = async (uri: string) => {
  console.log('[VOZ] Enviando audio a backend para transcripción:', uri);
  // Lee el archivo como binario y verifica que existe
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    console.error('[VOZ] El archivo de audio no existe:', uri);
    return undefined;
  }
  const fileUri = fileInfo.uri;
  const fileType = 'audio/m4a'; // o 'audio/wav' según el formato

  const formData = new FormData();
  // @ts-ignore
  formData.append('file', {
    uri: fileUri,
    name: 'audio.m4a',
    type: fileType,
  });

  const response = await fetch(`${BASE_URL}/transcribir-audio`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const data = await response.json();
  console.log('[VOZ] Texto transcripto recibido:', data.text);
  return data.text;
};

export default function NuevaVentaView() {
  const { productos, isLoading: isLoadingProductos } = useProductos();
  const { user } = useAuth();
  const { selectedEmpresa } = useEmpresa();
  const { reproducirCompra } = useSonidos();
  const apikey = undefined; // TODO: Implementar almacenamiento de API key

  const { shouldOpenScanner, setShouldOpenScanner } = useNavigation();

  const {
    productosSeleccionados,
    agregarProducto,
    eliminarProducto,
    actualizarCantidad,
    limpiarVenta,
    total,
    calcularGanancia,
  } = useSeleccionados(productos);

  const {
    mensaje,
    visible: visibleMensajeFlotante,
    anim: mensajeAnim,
    mostrarMensaje: mostrarMensajeFlotante,
  } = useMensajeFlotante();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [varianteModalVisible, setVarianteModalVisible] = useState(false);
  const [productoConVariantes, setProductoConVariantes] = useState<any>(null);
  const [modalApiKeyVisible, setModalApiKeyVisible] = useState(false);
  const [modalInterpretacionVisible, setModalInterpretacionVisible] = useState(false);
  const [productosInterpretados, setProductosInterpretados] = useState<any[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Estados para el sistema de voz
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Eliminamos la inicialización de la base local, ya no es necesaria.
  // useEffect(() => {
  //   setupProductosDB();
  // }, []);

  useEffect(() => {
    if (scannedData) {
      handleBarCodeScanned({ data: scannedData });
      setScannedData(null);
    }
  }, [scannedData]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScannerVisible(false);
    // const producto = await obtenerProductoPorCodigo(data);
    // Ahora buscamos el producto por código de barras usando la API real:
    const producto = await productoService.getByBarcode(data);

    if (producto) {
      if (producto.variantes && producto.variantes.length > 0) {
        setProductoConVariantes(producto);
        setVarianteModalVisible(true);
      } else {
        agregarProducto(producto, 1);
      }
    } else {
      Alert.alert('Producto no encontrado', 'El código de barras no corresponde a ningún producto.');
    }
  };

  const mostrarModalCantidad = (producto: any) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  const guardarVenta = async () => {
    if (productosSeleccionados.length === 0) return;

    // Verificar que hay una empresa seleccionada
    if (!selectedEmpresa?.id) {
      Alert.alert('Error', 'No hay empresa seleccionada para guardar la venta.');
      return;
    }

    // const venta: Venta = {
    //   fecha: new Date().toISOString(),
    //   totalProductos: productosSeleccionados.reduce((sum, p) => sum + p.cantidad, 0),
    //   precioTotal: total,
    //   ganancia: calcularGanancia(),
    //   productos: productosSeleccionados.map((p) => ({
    //     productoId: p.id!,
    //     cantidad: p.cantidad,
    //     precioUnitario: p.precioVenta,
    //     ganancia: (p.precioVenta - p.precioCosto) * p.cantidad,
    //     varianteId: p.varianteSeleccionada?.id,
    //   })),
    // };
    // Ahora armamos el objeto venta para la API real con empresaId:
    const venta = {
      fecha: new Date().toISOString(),
      totalProductos: productosSeleccionados.reduce((sum, p) => sum + p.cantidad, 0),
      precioTotal: total,
      ganancia: calcularGanancia(),
      empresaId: selectedEmpresa.id, // Agregamos el empresaId de la empresa seleccionada
      productos: productosSeleccionados.map((p) => ({
        productoId: p.id!,
        cantidad: p.cantidad,
        precioUnitario: p.precioVenta,
        ganancia: (p.precioVenta - p.precioCosto) * p.cantidad,
        varianteId: p.varianteSeleccionada?.id,
      })),
    };

    try {
      // await registrarVenta(venta);
      // Ahora usamos la API real para registrar la venta:
      await saleService.create(venta);
      mostrarMensajeFlotante('Venta guardada con éxito');
      reproducirCompra();
      limpiarVenta();
    } catch (error) {
      console.error('Error al guardar la venta:', error);
      Alert.alert('Error', 'No se pudo guardar la venta.');
    }
  };

  const handleGuardarApiKey = async (apikey: string) => {
    // TODO: Implementar almacenamiento de API key en nuestro sistema
    // Por ahora, solo cerramos el modal
    setModalApiKeyVisible(false);
    console.log('API Key guardada:', apikey);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 600, 
        useNativeDriver: true 
      }),
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 600, 
        useNativeDriver: true 
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (shouldOpenScanner) {
      if (permission?.granted) {
        setScannerVisible(true);
      } else {
        requestPermission();
      }
      setShouldOpenScanner(false);
    }
  }, [shouldOpenScanner, permission?.granted, requestPermission, setShouldOpenScanner]);

  const startRecording = async () => {
    try {
      console.log('[VOZ] Solicitando permisos e iniciando grabación...');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      console.log('[VOZ] Grabando...');
    } catch (err) {
      setIsRecording(false);
      console.error('[VOZ] Error al iniciar grabación:', err);
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!recording) return null;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      return uri;
    } catch (err) {
      console.error('[VOZ] Error al detener grabación:', err);
      setIsRecording(false);
      return null;
    }
  };

  // Elimino las funciones de AssemblyAI: uploadAudioToAssemblyAI, requestTranscription, pollTranscription

  const handleVoiceAssistant = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        setIsProcessing(true);
        try {
          console.log('[VOZ] Audio grabado, iniciando transcripción...');
          const textoTranscripto = await transcribeAudioWithBackend(uri);
          setTranscript(textoTranscripto);

          console.log('[VOZ] Enviando texto a interpretación IA:', textoTranscripto);
          const response = await fetch(`${BASE_URL}/interpretar-voz`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              texto: textoTranscripto,
              productos: productos,
            }),
          });
          const data = await response.json();
          console.log('[VOZ] Productos interpretados recibidos:', data.productos);
          setProductosInterpretados(data.productos || []);
          setModalInterpretacionVisible(true);
        } catch (error) {
          console.error('[VOZ] Error en el proceso:', error);
          Alert.alert('Error', 'No se pudo procesar el audio.');
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      await startRecording();
    }
  };

  const handleAgregarProductosInterpretados = (productos: any[]) => {
    productos.forEach((p: any) => {
      if (p.producto && p.cantidad) {
        agregarProducto(p.producto, p.cantidad, p.variante);
      }
    });
    setModalInterpretacionVisible(false);
  };

  const handleProductosEscaneados = (productosEscaneados: Array<{producto: Producto, cantidad: number, variante?: VarianteProducto}>) => {
    productosEscaneados.forEach(({ producto, cantidad, variante }) => {
      agregarProducto(producto, cantidad, variante);
    });
  };

  if (isLoadingProductos) {
    return <ModernLoading type="ventas" />;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <VentasHeader
        onScan={() => {
          if (permission?.granted) {
            setScannerVisible(true);
          } else {
            requestPermission();
          }
        }}
        onVerVentas={() => {}}
        cantidadProductos={productosSeleccionados.length}
      />
      
      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProductosDisponibles
            productos={productos}
            onAgregar={(producto) => agregarProducto(producto, 1)}
            onSeleccionarProducto={(producto) => {
              setProductoConVariantes(producto);
              setVarianteModalVisible(true);
            }}
          />
          <ProductosSeleccionados
            productosSeleccionados={productosSeleccionados}
            actualizarCantidad={actualizarCantidad}
            quitarProducto={eliminarProducto}
            calcularTotal={() => total}
            calcularGanancia={calcularGanancia}
            onGuardar={guardarVenta}
            onQR={() => {}}
          />
        </ScrollView>
      </View>
      
      <ModalCantidad
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        producto={productoSeleccionado}
        onUpdateCantidad={(p, c) => {
          if (p.id) {
            actualizarCantidad(p.id, c, p.varianteSeleccionada?.id);
          }
          setModalVisible(false);
        }}
        onDelete={(p) => {
          if (p.id) {
            eliminarProducto(p.id, p.varianteSeleccionada?.id);
          }
          setModalVisible(false);
        }}
      />
      <ModalVariante
        visible={varianteModalVisible}
        onClose={() => setVarianteModalVisible(false)}
        producto={productoConVariantes}
        onSelectVariante={(producto, variante) => {
          agregarProducto(producto, 1, variante);
          setVarianteModalVisible(false);
        }}
      />
      <ScannerModal
        visible={scannerVisible}
        productos={productos}
        onClose={() => setScannerVisible(false)}
        onBarCodeScanned={handleBarCodeScanned}
        onProductosEscaneados={handleProductosEscaneados}
      />
      <ModalApiKeyMercadoPago
        visible={modalApiKeyVisible}
        onClose={() => setModalApiKeyVisible(false)}
        onSaved={handleGuardarApiKey}
        currentApiKey={apikey}
      />
      {visibleMensajeFlotante && (
        <Animated.View style={[styles.mensajeFlotante, { transform: [{ translateY: mensajeAnim }] }]}>
          <Text style={styles.mensajeFlotanteText}>{mensaje}</Text>
        </Animated.View>
      )}
      <Toast />
      <AIFloatingButton
        onPress={handleVoiceAssistant}
        description={isRecording ? (isProcessing ? 'Procesando...' : 'Grabando...') : isProcessing ? 'Procesando...' : 'Asistente de voz para ventas'}
        isRecording={isRecording}
        disabled={isProcessing}
        variant="mic"
        isActive={isRecording || isProcessing}
        buttonColor={isRecording || isProcessing ? '#fca5a5' : undefined}
        robotColor={isRecording || isProcessing ? '#b91c1c' : undefined}
      />
      {/* Mostrar la transcripción debajo del botón de IA */}
      {transcript ? (
        <View style={{ margin: 16, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 10 }}>
          <Text style={{ color: '#334155', fontSize: 15, fontWeight: '500' }}>Transcripción:</Text>
          <Text style={{ color: '#0f172a', fontSize: 16, marginTop: 4 }}>{transcript}</Text>
        </View>
      ) : null}
      <ModalInterpretacionVoz
        visible={modalInterpretacionVisible}
        onClose={() => setModalInterpretacionVisible(false)}
        productosInterpretados={productosInterpretados}
        onAgregarAlCarrito={handleAgregarProductosInterpretados}
        textoOriginal={transcript}
      />
    </Animated.View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  productsList: {
    flex: 0.6,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedProducts: {
    flex: 0.4,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  selectedHeader: {
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: spacing.md,
  },
  totalsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: spacing.md,
  },
  lista: {
    flex: 1,
  },
  productoItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: spacing.xs,
    borderRadius: 16,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: spacing.xs,
  },
  productoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productoPrecio: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '700',
  },
  mensajeFlotante: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  mensajeFlotanteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 