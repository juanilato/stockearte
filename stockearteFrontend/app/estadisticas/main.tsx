import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEmpresa } from '../../context/EmpresaContext';
import AnalisisInventario from './components/AnalisisInventario';
import EstadisticasCard from './components/EstadisticasCard';
import EstadisticasHeader from './components/EstadisticasHeader';
import GraficoVentas from './components/GraficoVentas';
import MetricasFinancieras from './components/MetricasFinancieras';
import MetricasRendimiento from './components/MetricasRendimiento';
import ModalConfiguracion from './components/ModalConfiguracion';
import ModalStockCritico from './components/ModalStockCritico';
import SelectorGanancias from './components/SelectorGanancias';
import { useConfiguracionEstadisticas } from './hooks/useConfiguracionEstadisticas';
import { useEstadisticas } from './hooks/useEstadisticas';
import { useGanancias } from './hooks/useGanancias';
import { useMetricasAvanzadas } from './hooks/useMetricasAvanzadas';
import { useProductosCriticos } from './hooks/useProductosCriticos';
import { useVentasMensuales } from './hooks/useVentasMensuales';

export default function EstadisticasView() {
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { selectedEmpresa, loading: empresaLoading, empresas } = useEmpresa();
  const { estadisticas, cargarEstadisticas } = useEstadisticas();
  const { ganancias, tipoGanancia, setTipoGanancia, actualizarGanancias } = useGanancias();
  const { ventasMensuales, cargarVentasMensuales } = useVentasMensuales();
  const { productosCriticos, mostrarStockCritico, setMostrarStockCritico, cargarProductosCriticos } = useProductosCriticos();
  const { metricasAvanzadas, cargarMetricasAvanzadas } = useMetricasAvanzadas();
  const { configuracion, actualizarConfiguracion, restablecerConfiguracion } = useConfiguracionEstadisticas();

  // Debug logs
  console.log('🏢 EstadisticasView - selectedEmpresa:', selectedEmpresa);
  console.log('🏢 EstadisticasView - empresaLoading:', empresaLoading);
  console.log('🏢 EstadisticasView - empresas disponibles:', empresas?.length);

  useEffect(() => {
    const inicializar = async () => {
      try {
        const gananciasData = await cargarEstadisticas();
        actualizarGanancias(gananciasData);
        await Promise.all([
          cargarVentasMensuales(),
          cargarMetricasAvanzadas()
        ]);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error("❌ Error en inicialización:", error);
      } finally {
        setIsLoading(false);
      }
    };
    inicializar();
  }, []);

  // Mostrar loading mientras se carga la empresa
  if (empresaLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="chart-line" size={48} color="#94a3b8" />
        <Text style={styles.loadingText}>Cargando empresa...</Text>
      </View>
    );
  }

  // Mostrar loading mientras se cargan las estadísticas
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="chart-line" size={48} color="#94a3b8" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  // Mostrar mensaje si no hay estadísticas (no hay ventas)
  if (!estadisticas || (estadisticas.ventasTotales === 0 && estadisticas.stockTotal === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="chart-line-variant" size={48} color="#94a3b8" />
        <Text style={styles.loadingText}>No hay datos disponibles</Text>
        <Text style={styles.subText}>
          {estadisticas?.stockTotal === 0 
            ? 'Agrega productos y realiza ventas para ver las estadísticas'
            : 'Realiza tu primera venta para ver las estadísticas'
          }
        </Text>
      </View>
    );
  }

  // Mostrar mensaje si no hay empresa seleccionada
  if (!selectedEmpresa) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="office-building" size={48} color="#94a3b8" />
        <Text style={styles.loadingText}>No hay empresa seleccionada</Text>
        <Text style={styles.subText}>
          {empresas && empresas.length > 0 
            ? 'Selecciona una empresa para ver las estadísticas'
            : 'No hay empresas disponibles. Crea una empresa primero.'
          }
        </Text>
        {empresas && empresas.length > 0 && (
          <Text style={styles.subText}>
            Empresas disponibles: {empresas.length}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <EstadisticasHeader onConfigurar={() => setMostrarConfiguracion(true)} />

      {/* Contenido principal */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          {configuracion.mostrarStockTotal && (
            <EstadisticasCard
              icon="warehouse"
              value={estadisticas.stockTotal.toString()}
              label="Stock Total"
              color="#3b82f6"
            />
          )}
          
          {configuracion.mostrarStockCritico && (
            <EstadisticasCard
              icon="alert-circle-outline"
              value={estadisticas.productosStockCritico.toString()}
              label="Stock Crítico"
              color="#ef4444"
              onPress={() => {
                cargarProductosCriticos();
                setMostrarStockCritico(true);
              }}
            />
          )}
          
          {configuracion.mostrarGanancias && (
            <EstadisticasCard
              icon="chart-areaspline"
              value={`$${ganancias[tipoGanancia].toFixed(2)}`}
              label={`Ganancia (${tipoGanancia.toUpperCase()})`}
              color="#10b981"
            >
              <SelectorGanancias
                tipoGanancia={tipoGanancia}
                onTipoChange={setTipoGanancia}
              />
            </EstadisticasCard>
          )}
          
          {configuracion.mostrarProductoMasRentable && estadisticas.productoMasRentable && (
            <EstadisticasCard
              icon="trophy"
              value={estadisticas.productoMasRentable.nombre}
              label={`Rentabilidad: $${estadisticas.productoMasRentable.rentabilidad.toFixed(2)}`}
              color="#f59e0b"
            />
          )}
        </View>

        {/* Métricas de rendimiento */}
        {configuracion.mostrarMetricasRendimiento && metricasAvanzadas && (
          <MetricasRendimiento
            ticketPromedio={metricasAvanzadas.rendimientoVentas.ticketPromedio}
            productosPorVenta={metricasAvanzadas.rendimientoVentas.productosPorVenta}
            horariosPico={metricasAvanzadas.rendimientoVentas.horariosPico}
            diasActivos={metricasAvanzadas.rendimientoVentas.diasActivos}
            configuracion={configuracion}
          />
        )}

        {/* Métricas financieras */}
        {configuracion.mostrarMetricasFinancieras && metricasAvanzadas && (
          <MetricasFinancieras
            margenPromedio={metricasAvanzadas.metricasFinancieras.margenPromedio}
            flujoCaja={metricasAvanzadas.metricasFinancieras.flujoCaja}
            proyeccion={metricasAvanzadas.metricasFinancieras.proyeccion}
            configuracion={configuracion}
          />
        )}

        {/* Análisis de inventario */}
        {configuracion.mostrarAnalisisInventario && metricasAvanzadas && (
          <AnalisisInventario
            valorTotal={metricasAvanzadas.analisisInventario.valorTotal}
            rotacion={metricasAvanzadas.analisisInventario.rotacion}
            configuracion={configuracion}
          />
        )}

        {/* Gráfico de ventas */}
        {configuracion.mostrarGraficoVentas && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Ventas Mensuales</Text>
            <GraficoVentas data={ventasMensuales} />
          </View>
        )}
      </ScrollView>

      {/* Modal de stock crítico */}
      <ModalStockCritico
        visible={mostrarStockCritico}
        productos={productosCriticos}
        onClose={() => setMostrarStockCritico(false)}
      />

      {/* Modal de configuración */}
      <ModalConfiguracion
        visible={mostrarConfiguracion}
        configuracion={configuracion}
        onClose={() => setMostrarConfiguracion(false)}
        onConfiguracionChange={actualizarConfiguracion}
        onRestablecer={restablecerConfiguracion}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 16,
    fontWeight: '500',
  },
  subText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  chartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
}); 