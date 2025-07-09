import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Material } from '../../../services/api';

 // Material item 
interface MaterialItemProps {
  material: Material;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
}

// Funciones de edición y de Eliminacion de material con swipe right sobre item 
function SwipeActions({ item, onEdit, onDelete }: any) {
  return (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[styles.quickAction, styles.quickEdit]}
        onPress={() => onEdit(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="pencil-outline" size={22} color="#64748b" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quickAction, styles.quickDelete]}
        onPress={() => onDelete(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

const MaterialItem: React.FC<MaterialItemProps> = ({ material, onEdit, onDelete }) => {
  const stockStatus = material.stock <= 5 ? 'critical' : material.stock <= 15 ? 'low' : 'good';

  return (
    <View style={styles.productoWrapper}>
      <Swipeable
        renderRightActions={() => (
          <SwipeActions item={material} onEdit={onEdit} onDelete={onDelete} />
        )}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
      >
        <View style={styles.productoCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="cube-outline" size={24} color="#6366f1" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.nombre}>{material.nombre}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.stockBadge, styles[`stockBadge${stockStatus}`]]}>
                  <MaterialCommunityIcons 
                    name={stockStatus === 'critical' ? 'alert-circle' : stockStatus === 'low' ? 'alert' : 'check-circle'} 
                    size={12} 
                    color="#ffffff" 
                  />
                  <Text style={styles.stockBadgeText}>{material.stock}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.infoContainer}>
              <Text style={styles.unidadLabel}>Unidad</Text>
              <Text style={styles.unidad}>{material.unidad || 'u'}</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Precio</Text>
              <Text style={styles.costo}>${material.precioCosto}</Text>
            </View>
          </View>
        </View>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  productoWrapper: {
    marginHorizontal: 12,
    marginBottom: 10,
  },
  productoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockBadgecritical: {
    backgroundColor: '#ef4444',
  },
  stockBadgelow: {
    backgroundColor: '#f59e0b',
  },
  stockBadgegood: {
    backgroundColor: '#10b981',
  },
  stockBadgeText: {
    fontSize: wp('3.2%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoContainer: {
    alignItems: 'flex-start',
  },
  unidadLabel: {
    fontSize: wp('3%'),
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  unidad: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#475569',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: wp('3%'),
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  costo: {
    fontSize: wp('4.2%'),
    fontWeight: '700',
    color: '#0ea5e9',
  },
  // Swipe actions
  quickActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    height: '100%',
    paddingRight: 12,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  quickAction: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickEdit: {
    backgroundColor: '#ffffff',
  },
  quickDelete: {
    backgroundColor: '#ffffff',
  },
});

export default MaterialItem; 