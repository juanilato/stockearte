import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MaterialesHeaderProps {
  nombre: string;
  setNombre: (v: string) => void;
  costoDesde: string;
  setCostoDesde: (v: string) => void;
  costoHasta: string;
  setCostoHasta: (v: string) => void;
  stockDesde: string;
  setStockDesde: (v: string) => void;
  stockHasta: string;
  setStockHasta: (v: string) => void;
  onAgregar: () => void;
  onActualizarPrecios: () => void;
  cantidad: number;
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

// Recepción de parametros de filtros
// Creacion de Material nuevo
// Actualización de precios varios

const MaterialesHeader: React.FC<MaterialesHeaderProps> = ({
  nombre, setNombre,
  costoDesde, setCostoDesde,
  costoHasta, setCostoHasta,
  stockDesde, setStockDesde,
  stockHasta, setStockHasta,
  onAgregar,
  onActualizarPrecios,
  cantidad,
  isExpanded,
  setExpanded
}) => {
  const reset = () => {
    setNombre("");
    setCostoDesde("");
    setCostoHasta("");
    setStockDesde("");
    setStockHasta("");
  }
  // Nuevo estado para controlar el menú de acciones
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Valores animados para los botones
  const preciosOffset = useSharedValue(0);
  const filtrosOffset = useSharedValue(0);
  // Nuevo valor animado para el botón de agregar
  const agregarOffset = useSharedValue(0);

  // Ajuste final: separación pequeña y grupo bien a la derecha, con animación
  const BUTTON_SPACING = 40; // Separación pequeña pero visible
  const BASE_OFFSET = 50;   // Más negativo = más a la derecha

  // Animaciones de los botones y contenido
  const preciosStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: preciosOffset.value }],
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
  
  // Animación para el contenido de la izquierda
  const titleOpacity = useSharedValue(1);
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));
  
  // Animación para el contenedor de acciones
  const containerWidth = useSharedValue(140);
  const containerStyle = useAnimatedStyle(() => ({
    width: containerWidth.value,
  }));

  // Animación de apertura/cierre del menú
  const toggleMenu = () => {
    if (!menuOpen) {
      // Al abrir: los botones se expanden por todo el ancho
      preciosOffset.value = withSpring(-60, { damping: 12 });
      filtrosOffset.value = withSpring(-120, { damping: 12 });
      agregarOffset.value = withSpring(-180, { damping: 12 });
      containerWidth.value = withSpring(-240, { damping: 12 });
      // Fade out del título
      titleOpacity.value = withSpring(0, { damping: 12 });
    } else {
      // Al cerrar: todos los botones vuelven a su lugar
      preciosOffset.value = withSpring(0, { damping: 12 });
      filtrosOffset.value = withSpring(0, { damping: 12 });
      agregarOffset.value = withSpring(0, { damping: 12 });
      containerWidth.value = withSpring(140, { damping: 12 });
      // Fade in del título
      titleOpacity.value = withSpring(1, { damping: 12 });
    }
    setMenuOpen(!menuOpen);
  };

  // Animación y lógica para expandir/cerrar los filtros (se mantiene igual)
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!isExpanded);
  };

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <Animated.View style={[styles.titleSection, titleStyle]}>
          <View style={styles.titleContainer}>
            <Text style={styles.tituloModern}>🧱 Materiales</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cantidad}</Text>
            </View>
          </View>
          <Text style={styles.subtituloModern}>
            Materiales registrados en total
          </Text>
        </Animated.View>
        
        {/* Menú de acciones moderno */}
        <Animated.View style={[styles.actionsContainer, containerStyle]}>
          {menuOpen && (
            <Animated.View style={[styles.actionButton, preciosStyle]}> 
              <TouchableOpacity 
                style={styles.actionButtonInner}
                onPress={onActualizarPrecios}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="currency-usd" size={20} color="#6366f1" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {menuOpen && (
            <Animated.View style={[styles.actionButton, filtrosStyle]}> 
              <TouchableOpacity 
                style={styles.actionButtonInner}
                onPress={toggleExpand}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "tune-variant"} size={20} color="#6366f1" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {menuOpen && (
            <Animated.View style={[styles.actionButton, agregarStyle]}> 
              <TouchableOpacity 
                style={styles.actionButtonInner}
                onPress={onAgregar}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#6366f1" />
              </TouchableOpacity>
            </Animated.View>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDestacado]}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={menuOpen ? "close" : "cube-outline"} size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
      {/* Filtros, solo visibles si están expandidos */}
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
              <TextInput style={styles.inputFiltro} placeholder="Desde" value={costoDesde} onChangeText={setCostoDesde} keyboardType="numeric" placeholderTextColor="#64748b" />
              <TextInput style={styles.inputFiltro} placeholder="Hasta" value={costoHasta} onChangeText={setCostoHasta} keyboardType="numeric" placeholderTextColor="#64748b" />
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
    backgroundColor: '#ffffff',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  titleSection: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  tituloModern: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  badgeContainer: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtituloModern: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
    width: 140,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  actionButton: {
    padding: 8,
    borderRadius: 99,
    position: 'absolute',
    right: 10,
    backgroundColor: '#f8fafc',
    marginLeft: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonInner: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonDestacado: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filtersContainer: {
    paddingTop: 16,
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 5,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  inputNombre: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rowFiltros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  filtroGroup: {
    flex: 1,
  },
  filtroLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputFiltro: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

export default MaterialesHeader; 