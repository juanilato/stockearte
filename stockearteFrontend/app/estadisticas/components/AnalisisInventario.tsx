import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ConfiguracionEstadisticas } from '../types';
import EstadisticasCard from './EstadisticasCard';

interface AnalisisInventarioProps {
  valorTotal: {
    costo: number;
    venta: number;
    diferencia: number;
  };
  rotacion: {
    promedio: number;
    productos: { nombre: string; diasRotacion: number }[];
  };
  configuracion: ConfiguracionEstadisticas;
}

export default function AnalisisInventario({ 
  valorTotal, 
  rotacion,
  configuracion
}: AnalisisInventarioProps) {
  // Verificar si hay al menos un elemento configurado para mostrar
  const elementosVisibles = [
    configuracion.mostrarValorTotal,
    configuracion.mostrarRotacion,
  ].filter(Boolean);

  if (elementosVisibles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Análisis de Inventario</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{elementosVisibles.length}</Text>
        </View>
      </View>
      
      <View style={styles.cardsContainer}>
        {configuracion.mostrarValorTotal && (
          <>
            <EstadisticasCard
              icon="warehouse"
              value={`$${valorTotal.costo.toFixed(2)}`}
              label="Valor en Costo"
              color="#ef4444"
            />
            
            <EstadisticasCard
              icon="tag"
              value={`$${valorTotal.venta.toFixed(2)}`}
              label="Valor en Venta"
              color="#10b981"
            />
            
            <EstadisticasCard
              icon="cash-multiple"
              value={`$${valorTotal.diferencia.toFixed(2)}`}
              label="Potencial Ganancia"
              color="#3b82f6"
            />
          </>
        )}
        
        {configuracion.mostrarRotacion && (
          <EstadisticasCard
            icon="refresh"
            value={`${rotacion.promedio.toFixed(1)} días`}
            label="Rotación Promedio"
            color="#f59e0b"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  badge: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
}); 