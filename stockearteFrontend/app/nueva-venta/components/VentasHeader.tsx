import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VentasHeaderProps {
  onScan: () => void;
  onVerVentas: () => void;
  cantidadProductos?: number;
}

const VentasHeader: React.FC<VentasHeaderProps> = ({ onScan, cantidadProductos = 0 }) => {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <View style={styles.titleSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.tituloModern}>🛒 Nueva Venta</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cantidadProductos}</Text>
            </View>
          </View>
          <Text style={styles.subtituloModern}>
            Escanea productos para comenzar
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.scanButton}
          onPress={onScan}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="barcode-scan" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tituloModern: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8,
  },
  badgeContainer: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  subtituloModern: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default VentasHeader; 