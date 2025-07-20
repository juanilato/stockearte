import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ModernLoading from '../components/ModernLoading';
// import { Material, actualizarMaterial, setupProductosDB } from '../../services/db';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { Empresa } from '../../services/api';
import ModalPreciosMateriales from '../materiales/components/ModalPreciosMateriales';
import MetricasHoy from '../components/MetricasHoy';
import ModalEstadisticasDestacadas from '../components/ModalEstadisticasDestacadas';
import ModalGestionProductos from '../components/ModalGestionProductos';
import HeaderIntegrado from '../components/HeaderIntegrado';
import { useProductos } from '../productos/hooks/useProductos';
import { useEmpresa } from '../../context/EmpresaContext';
import { useEstadisticas } from '../estadisticas/hooks/useEstadisticas';
import { useMateriales } from '../materiales/hooks/useMateriales';
import { useAnimacionesInicio } from './hooks/useAnimacionesInicio';


interface Usuario {
  nombre: string;
  rol: string;
  ultimoAcceso: string;
}

export default function InicioView() {
  const {
    fadeAnim,
    slideAnim,
    welcomeSlideAnim,
    metricsSlideAnim,
    actionsSlideAnim,
    statsSlideAnim,
    activitySlideAnim,
    iniciarAnimaciones,
  } = useAnimacionesInicio();
  
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  const [modalEstadisticasVisible, setModalEstadisticasVisible] = useState(false);
  const [modalMaterialesVisible, setModalMaterialesVisible] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  
  const { navigateToTab, setShouldOpenScanner } = useNavigation();
  const { selectedEmpresa: empresaContext, loading: empresaLoading } = useEmpresa();
  const { estadisticas, cargarEstadisticas } = useEstadisticas();
  const { materiales } = useMateriales(empresaContext?.id);
  const { productos, loading: productosLoading, cargarProductos } = useProductos({ empresaId: empresaContext?.id });

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
        setIsLoading(true);
        // await setupProductosDB();
        
        // Cargar estadísticas si hay empresa seleccionada
        if (empresaContext) {
          await cargarEstadisticas();
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();

    // Iniciar animaciones
    iniciarAnimaciones();
  }, [empresaContext?.id]);

  const handleEmpresaChange = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    // Aquí podrías cargar datos específicos de la empresa seleccionada
    console.log('Empresa seleccionada:', empresa);
  };

  const handleGuardarPrecios = async (materialesActualizados: any[]): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Implementar actualización de precios usando el backend
      console.log('Actualizando precios de materiales:', materialesActualizados);
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

  // Mostrar loading mientras se carga la empresa
  if (empresaLoading) {
    return <ModernLoading type="inicio" message="Cargando empresa..." />;
  }

  // Mostrar loading mientras se cargan las estadísticas
  if (isLoading) {
    return <ModernLoading type="inicio" />;
  }

  // Mostrar mensaje si no hay empresa seleccionada
  if (!empresaContext) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="office-building" size={48} color="#94a3b8" />
        <Text style={styles.loadingText}>No hay empresa seleccionada</Text>
        <Text style={styles.subText}>
          Selecciona una empresa para ver el dashboard
        </Text>
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: slideAnim } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Welcome Section */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              transform: [{ translateX: welcomeSlideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>¡Bienvenido de vuelta!</Text>
            <Text style={styles.welcomeSubtitle}>
              {user?.email ? `Hola, ${user.email.split('@')[0]}` : 'Hola, Usuario'}
            </Text>
          </View>
          <View style={styles.welcomeIcon}>
            <MaterialCommunityIcons name="hand-wave" size={32} color="#6366f1" />
          </View>
        </Animated.View>

        {/* Métricas destacadas */}
        {estadisticas && (
          <Animated.View 
            style={[
              styles.metricsSection,
              {
                transform: [{ translateX: metricsSlideAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <MetricasHoy 
              gananciaHoy={estadisticas.ganancias?.dia || 0} 
              ventasHoy={estadisticas.ventasTotales || 0} 
            />
          </Animated.View>
        )}

        {/* Acciones Rápidas */}
        <Animated.View 
          style={[
            styles.section,
            {
              transform: [{ translateX: actionsSlideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <Text style={styles.sectionSubtitle}>Accede a las funciones principales</Text>
          </View>
          
          <View style={styles.accionesGrid}>
            <TouchableOpacity 
              style={styles.accionCard} 
              onPress={handleNuevaVenta}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons name="plus-circle" size={24} color="#ffffff" />
              </View>
              <Text style={styles.accionLabel}>Nueva Venta</Text>
              <Text style={styles.actionSubtitle}>Registrar venta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.accionCard} 
              onPress={() => setModalEstadisticasVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, styles.purpleBg]}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#ffffff" />
              </View>
              <Text style={styles.accionLabel}>Estadísticas</Text>
              <Text style={styles.actionSubtitle}>Ver métricas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.accionCard} 
              onPress={() => setModalProductosVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, styles.greenBg]}>
                <MaterialCommunityIcons name="package-variant" size={24} color="#ffffff" />
              </View>
              <Text style={styles.accionLabel}>Productos</Text>
              <Text style={styles.actionSubtitle}>Gestionar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.accionCard} 
              onPress={() => setModalMaterialesVisible(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, styles.orangeBg]}>
                <MaterialCommunityIcons name="basket" size={24} color="#ffffff" />
              </View>
              <Text style={styles.accionLabel}>Materiales</Text>
              <Text style={styles.actionSubtitle}>Gestionar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.section,
            {
              transform: [{ translateX: statsSlideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumen Rápido</Text>
            <Text style={styles.sectionSubtitle}>Vista general de tu negocio</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#10b981" />
              <Text style={styles.statValue}>${estadisticas?.ganancias?.dia?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.statLabel}>Ventas Hoy</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardBlue]}>
              <MaterialCommunityIcons name="package-variant-closed" size={20} color="#3b82f6" />
              <Text style={styles.statValue}>{estadisticas?.stockTotal || 0}</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardOrange]}>
              <MaterialCommunityIcons name="basket-outline" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>{materiales.length}</Text>
              <Text style={styles.statLabel}>Materiales</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardPurple]}>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#8b5cf6" />
              <Text style={styles.statValue}>{estadisticas?.ventasTotales || 0}</Text>
              <Text style={styles.statLabel}>Ventas Totales</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View 
          style={[
            styles.section,
            {
              transform: [{ translateX: activitySlideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <Text style={styles.sectionSubtitle}>Últimas acciones realizadas</Text>
          </View>
          
          <View style={styles.activityContainer}>
            <View style={styles.emptyActivity}>
              <MaterialCommunityIcons name="clock-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyActivityTitle}>Sin actividad reciente</Text>
              <Text style={styles.emptyActivitySubtitle}>
                {estadisticas?.ventasTotales === 0 
                  ? 'Realiza tu primera venta para ver la actividad aquí'
                  : 'No hay actividad reciente para mostrar'
                }
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modals */}
      <ModalEstadisticasDestacadas
        visible={modalEstadisticasVisible}
        onClose={() => setModalEstadisticasVisible(false)}
        estadisticas={estadisticas}
      />
      <ModalGestionProductos
        visible={modalProductosVisible}
        onClose={() => setModalProductosVisible(false)}
        productosPrecargados={productos}
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
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    paddingBottom: 24,
  },
  
  // Welcome Section
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  // Metrics Section
  metricsSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  
  // Sections
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Actions Grid
  accionesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
  },
  accionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    transform: [{ scale: 1 }],
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  purpleBg: {
    backgroundColor: '#8b5cf6',
  },
  greenBg: {
    backgroundColor: '#10b981',
  },
  orangeBg: {
    backgroundColor: '#f59e0b',
  },
  accionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  primaryActionSubtext: {
    color: '#e0e7ff',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statCardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statCardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  
  // Activity Section
  activityContainer: {
    paddingHorizontal: 20,
  },
  emptyActivity: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  emptyActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyActivitySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});