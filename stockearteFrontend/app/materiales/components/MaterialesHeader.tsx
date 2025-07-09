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

  // Animaciones de los botones (usando los valores animados para que funcione la animación)
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

  // Animación de apertura/cierre del menú
  const toggleMenu = () => {
    if (!menuOpen) {
      // Al abrir: cada botón se separa un poco a la izquierda del principal, pero el grupo queda bien a la derecha
      preciosOffset.value = withSpring(-BUTTON_SPACING , { damping: 12 });
      filtrosOffset.value = withSpring(-BUTTON_SPACING * 2 , { damping: 12 });
      agregarOffset.value = withSpring(-BUTTON_SPACING * 3 , { damping: 12 });
    } else {
      // Al cerrar: todos los botones vuelven a su lugar
      preciosOffset.value = withSpring(0, { damping: 12 });
      filtrosOffset.value = withSpring(0, { damping: 12 });
      agregarOffset.value = withSpring(0, { damping: 12 });
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
        <View style={{ flex: 1 }}>
        <View style={{ gap: 2 }}>
  <Text style={styles.tituloModern}>🧱 Materiales</Text>
  <Text style={styles.subtituloModern}>
    <Text style={{ fontWeight: '700', color: '#0f172a' }}>{cantidad}</Text> registrados en total
  </Text>
</View>
        </View>
        {/* Menú de acciones animado */}
        <View style={styles.actionsContainer}>
          {/* Botón de actualizar precios, animado y solo visible con el menú abierto */}
          {menuOpen && (
            <Animated.View style={[styles.actionButton, preciosStyle]}> 
              <TouchableOpacity onPress={onActualizarPrecios}>
                <MaterialCommunityIcons name="currency-usd" size={22} color="#475569" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {/* Botón de filtros, animado y solo visible con el menú abierto */}
          {menuOpen && (
            <Animated.View style={[styles.actionButton, filtrosStyle]}> 
              <TouchableOpacity onPress={toggleExpand}>
                <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "tune-variant"} size={22} color="#475569" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {/* Botón de agregar material, animado y solo visible con el menú abierto */}
          {menuOpen && (
            <Animated.View style={[styles.actionButton, agregarStyle]}> 
              <TouchableOpacity onPress={onAgregar}>
                <MaterialCommunityIcons name="plus" size={22} color="#475569" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {/* Botón principal: box de materiales o X según estado */}
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDestacado]}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            {/* Cambiado: cube-outline (box) cuando está cerrado, close cuando está abierto */}
            <MaterialCommunityIcons name={menuOpen ? "close" : "cube-outline"} size={22} color="#fff" />
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#f8fafc',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    width: 140,
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

export default MaterialesHeader; 