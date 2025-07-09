import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Material, actualizarMaterial, obtenerEstadisticas, obtenerMateriales, setupProductosDB } from '../../services/db';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { Empresa } from '../../services/api';
import ModalPreciosMateriales from '../materiales/components/ModalPreciosMateriales';
import MetricasHoy from './MetricasHoy';
import ModalEstadisticasDestacadas from './ModalEstadisticasDestacadas';
import ModalGestionProductos from './ModalGestionProductos';
import HeaderIntegrado from './HeaderIntegrado';
import { useProductos } from '../productos/hooks/useProductos';

interface Usuario {
  nombre: string;
  rol: string;
  ultimoAcceso: string;
}

export default function InicioView() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  const [modalEstadisticasVisible, setModalEstadisticasVisible] = useState(false);
  const [modalMaterialesVisible, setModalMaterialesVisible] = useState(false);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  
  const { navigateToTab, setShouldOpenScanner } = useNavigation();

  // Hook para mantener productos sincronizados con la empresa seleccionada
  useProductos({ empresaId: selectedEmpresa?.id });

  const usuario: Usuario = {
    nombre: user?.email || 'Usuario',
    rol: 'Administrador',
    ultimoAcceso: 'Hace 5 minutos',
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await setupProductosDB();
        const stats = await obtenerEstadisticas();
        setEstadisticas(stats);
        obtenerMateriales(setMateriales);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEmpresaChange = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    // Aquí podrías cargar datos específicos de la empresa seleccionada
    console.log('Empresa seleccionada:', empresa);
  };

  // Debug: Verificar que el usuario tenga ID válido
  useEffect(() => {
    if (user) {
      console.log('=== InicioView Debug ===');
      console.log('Usuario actual:', user);
      console.log('ID del usuario:', user.id);
      console.log('Tipo de ID:', typeof user.id);
    } else {
      console.log('=== InicioView Debug ===');
      console.log('No hay usuario autenticado');
    }
  }, [user]);



  const handleGuardarPrecios = async (materialesActualizados: Material[]): Promise<{ success: boolean; message: string }> => {
    try {
      for (const material of materialesActualizados) {
        await actualizarMaterial(material);
      }
      obtenerMateriales(setMateriales);
      return { success: true, message: 'Precios actualizados con éxito' };
    } catch (e) {
      console.error("Error al guardar precios:", e);
      return { success: false, message: 'Hubo un error al guardar los precios' };
    }
  };

  const handleNuevaVenta = () => {
    navigateToTab('ventas');
    setShouldOpenScanner(true);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="chart-line" size={48} color="#94a3b8" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header Integrado */}
      <HeaderIntegrado
        user={user}
        selectedEmpresa={selectedEmpresa}
        onEmpresaChange={handleEmpresaChange}
        onLogout={handleLogout}
      />

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {estadisticas && (
          <MetricasHoy 
            gananciaHoy={estadisticas.gananciaHoy || 0} 
            ventasHoy={estadisticas.ventasHoy || 0} 
          />
        )}

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.accionesGrid}>
            <TouchableOpacity style={styles.accionCard} onPress={handleNuevaVenta}>
              <MaterialCommunityIcons name="plus-circle-outline" size={28} color="#3b82f6" />
              <Text style={styles.accionLabel}>Nueva Venta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accionCard} onPress={() => setModalEstadisticasVisible(true)}>
              <MaterialCommunityIcons name="chart-bar" size={28} color="#8b5cf6" />
              <Text style={styles.accionLabel}>Estadísticas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accionCard} onPress={() => setModalProductosVisible(true)}>
              <MaterialCommunityIcons name="package-variant-closed" size={28} color="#10b981" />
              <Text style={styles.accionLabel}>Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accionCard} onPress={() => setModalMaterialesVisible(true)}>
              <MaterialCommunityIcons name="basket-outline" size={28} color="#f59e0b" />
              <Text style={styles.accionLabel}>Materiales</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Últimos Movimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
          <View style={styles.emptyMovimientos}>
            <Text style={styles.emptyMovimientosText}>Aún no hay movimientos recientes.</Text>
          </View>
        </View>
      </ScrollView>


      <ModalEstadisticasDestacadas
        visible={modalEstadisticasVisible}
        onClose={() => setModalEstadisticasVisible(false)}
      />
      <ModalGestionProductos
        visible={modalProductosVisible}
        onClose={() => setModalProductosVisible(false)}
      />
      <ModalPreciosMateriales
        visible={modalMaterialesVisible}
        onClose={() => setModalMaterialesVisible(false)}
        materiales={materiales}
        onGuardar={handleGuardarPrecios}
      />

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  mainContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  accionesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  accionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  accionLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  movimientosContainer: {},
  emptyMovimientos: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyMovimientosText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
});