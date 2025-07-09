// Componente de cabecera para la vista de productos, incluye filtros, botones de acción y resumen de cantidad de productos.
// Permite filtrar, agregar, escanear y modificar precios de productos.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProductosHeaderProps {
  nombre: string;
  setNombre: (v: string) => void;
  precioCostoDesde: string;
  setPrecioCostoDesde: (v: string) => void;
  precioCostoHasta: string;
  setPrecioCostoHasta: (v: string) => void;
  precioVentaDesde: string;
  setPrecioVentaDesde: (v: string) => void;
  precioVentaHasta: string;
  setPrecioVentaHasta: (v: string) => void;
  stockDesde: string;
  setStockDesde: (v: string) => void;
  stockHasta: string;
  setStockHasta: (v: string) => void;
  onAgregar: () => void;
  onScan: () => void;
  onPrice: () => void;
  cantidad: number;
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const ProductosHeader: React.FC<ProductosHeaderProps> = ({
  nombre, setNombre,
  precioCostoDesde, setPrecioCostoDesde,
  precioCostoHasta, setPrecioCostoHasta,
  precioVentaDesde, setPrecioVentaDesde,
  precioVentaHasta, setPrecioVentaHasta,
  stockDesde, setStockDesde,
  stockHasta, setStockHasta,
  onAgregar,
  onScan,
  onPrice,
  cantidad,
  isExpanded,
  setExpanded
}) => {
  const reset = () => {
    setNombre("");
    setPrecioCostoDesde("");
    setPrecioCostoHasta("");
    setPrecioVentaDesde("");
    setPrecioVentaHasta("");
    setStockDesde("");
    setStockHasta("");
  }
  // Animación y lógica para expandir/cerrar los filtros
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!isExpanded);
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);
  // --- Animación de menú de acciones (igual que MaterialesHeader) ---
  const [menuOpen, setMenuOpen] = React.useState(false);
  const precioOffset = useSharedValue(0);
  const scanOffset = useSharedValue(0);
  const filtrosOffset = useSharedValue(0);
  const agregarOffset = useSharedValue(0);
  const BUTTON_SPACING = 40;

  const precioStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: precioOffset.value }],
    opacity: menuOpen ? 1 : 0,
  }));
  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scanOffset.value }],
    opacity: menuOpen ? 1 : 0,
  }));
  const filtrosStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: filtrosOffset.value }],
    opacity: menuOpen ? 1 : 0,
  }));
  const agregarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: agregarOffset.value }],
    opacity: menuOpen ? 1 : 0,
  }));

  const toggleMenu = () => {
    if (!menuOpen) {
      precioOffset.value = withSpring(-BUTTON_SPACING, { damping: 12 });
      scanOffset.value = withSpring(-BUTTON_SPACING * 2, { damping: 12 });
      filtrosOffset.value = withSpring(-BUTTON_SPACING * 3, { damping: 12 });
      agregarOffset.value = withSpring(-BUTTON_SPACING * 4, { damping: 12 });
    } else {
      precioOffset.value = withSpring(0, { damping: 12 });
      scanOffset.value = withSpring(0, { damping: 12 });
      filtrosOffset.value = withSpring(0, { damping: 12 });
      agregarOffset.value = withSpring(0, { damping: 12 });
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
        <View style={{ gap: 2 }}>
  <Text style={styles.tituloModern}>📦 Inventario</Text>
  <Text style={styles.subtituloModern}>
    <Text style={{ fontWeight: '700', color: '#0f172a' }}>{cantidad}</Text> productos registrados
  </Text>
</View>
        </View>
        <View style={styles.actionsContainer}>
  {menuOpen && (
    <Animated.View style={[styles.actionButton, precioStyle]}> 
      <TouchableOpacity onPress={onPrice}>
        <MaterialCommunityIcons name="currency-usd" size={22} color="#475569" />
      </TouchableOpacity>
    </Animated.View>
  )}
  {menuOpen && (
    <Animated.View style={[styles.actionButton, scanStyle]}> 
      <TouchableOpacity onPress={onScan}>
        <MaterialCommunityIcons name="barcode-scan" size={22} color="#475569" />
      </TouchableOpacity>
    </Animated.View>
  )}
  {menuOpen && (
    <Animated.View style={[styles.actionButton, filtrosStyle]}> 
      <TouchableOpacity onPress={toggleExpand}>
        <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "tune-variant"} size={22} color="#475569" />
      </TouchableOpacity>
    </Animated.View>
  )}
  {menuOpen && (
    <Animated.View style={[styles.actionButton, agregarStyle]}> 
      <TouchableOpacity onPress={onAgregar}>
        <MaterialCommunityIcons name="plus" size={22} color="#475569" />
      </TouchableOpacity>
    </Animated.View>
  )}
  <TouchableOpacity
    style={[styles.actionButton, styles.actionButtonDestacado]}
    onPress={toggleMenu}
    activeOpacity={0.8}
  >
    <MaterialCommunityIcons name={menuOpen ? "close" : "package-variant"} size={22} color="#fff" />
  </TouchableOpacity>
</View>
      </View>

      {isExpanded && (
        <View style={styles.filtersContainer}>
          <View style={styles.filtersHeader}>
            <TextInput
              style={styles.inputNombre}
              placeholder="Buscar por nombre..."
              placeholderTextColor="#64748b"
              value={nombre}
              onChangeText={setNombre}
            />
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={reset}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="refresh" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <View style={styles.rowFiltros}>
            <View style={styles.filtroGroup}>
              <Text style={styles.filtroLabel}>Costo</Text>
              <TextInput style={styles.inputFiltro} placeholder="Desde" value={precioCostoDesde} onChangeText={setPrecioCostoDesde} keyboardType="numeric" placeholderTextColor="#64748b" />
              <TextInput style={styles.inputFiltro} placeholder="Hasta" value={precioCostoHasta} onChangeText={setPrecioCostoHasta} keyboardType="numeric" placeholderTextColor="#64748b" />
            </View>
            <View style={styles.filtroGroup}>
              <Text style={styles.filtroLabel}>Venta</Text>
              <TextInput style={styles.inputFiltro} placeholder="Desde" value={precioVentaDesde} onChangeText={setPrecioVentaDesde} keyboardType="numeric" placeholderTextColor="#64748b" />
              <TextInput style={styles.inputFiltro} placeholder="Hasta" value={precioVentaHasta} onChangeText={setPrecioVentaHasta} keyboardType="numeric" placeholderTextColor="#64748b" />
            </View>
            <View style={styles.filtroGroup}>
              <Text style={styles.filtroLabel}>Stock</Text>
              <TextInput style={styles.inputFiltro} placeholder="Desde" value={stockDesde} onChangeText={setStockDesde} keyboardType="numeric" placeholderTextColor="#64748b" />
              <TextInput style={styles.inputFiltro} placeholder="Hasta" value={stockHasta} onChangeText={setStockHasta} keyboardType="numeric" placeholderTextColor="#64748b" />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#f8fafc', // fondo gris claro moderno
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, // para Android
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
  
  tituloModern: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  subtituloModern: {
    fontSize: 15,
    color: '#64748b',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 99,
    padding: 4,
    width: 180, // Un poco más ancho para 4 botones
  },
  actionButton: {
    padding: 8,
    borderRadius: 99,
    position: 'absolute',
    right: 10,
    backgroundColor: '#f1f5f9',
    marginLeft: 4,
  },
  actionButtonDestacado: {
    backgroundColor: '#3b82f6',
    position: 'absolute',
    right: 10,
    zIndex: 2,
  },
  filtersContainer: {
    paddingTop: 14,
    position: 'absolute',
    top: 88,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 5,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  inputNombre: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowFiltros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filtroGroup: {
    flex: 1,
  },
  filtroLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputFiltro: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 6,
  },
});

export default ProductosHeader; 