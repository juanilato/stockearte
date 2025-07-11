import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface MetricasHoyProps {
  gananciaHoy: number;
  ventasHoy: number;
}

const MetricasHoy: React.FC<MetricasHoyProps> = ({ gananciaHoy, ventasHoy }) => {
  return (
    <View style={styles.containerModern}>
      <Text style={styles.tituloModern}>Hoy</Text>
      <View style={styles.cardsRowModern}>
        <View style={[styles.cardModern, styles.ventasCardModern]}>
          <MaterialCommunityIcons name="cash-multiple" size={26} color="#10b981" style={{ marginRight: 10 }} />
          <View style={styles.textContainerModern}>
            <Text style={styles.labelModern}>Cantidad Venta</Text>
            <Text style={styles.valueModern}>{ventasHoy}</Text>
          </View>
        </View>
        <View style={[styles.cardModern, styles.gananciaCardModern]}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={26} color="#3b82f6" style={{ marginRight: 10 }} />
          <View style={styles.textContainerModern}>
            <Text style={styles.labelModern}>Ganancia</Text>
            <Text style={styles.valueModern}>${gananciaHoy.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerModern: {
    marginTop: 18,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  tituloModern: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  cardsRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardModern: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ventasCardModern: {
    marginRight: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  gananciaCardModern: {
    marginLeft: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  textContainerModern: {
    marginLeft: 8,
  },
  labelModern: {
    fontSize: RFValue(13),
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  valueModern: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.2,
  },
});

export default MetricasHoy; 