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
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="cube-outline" size={22} color="#64748b" />
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.nombre}>{material.nombre}</Text>
              <Text style={styles.stock}>Stock: {material.stock} {material.unidad || 'u'}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.costo}>${material.precioCosto}</Text>
              <Text style={styles.unidad}>{material.unidad}</Text>
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
    backgroundColor: '#f8fafc', // light
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0', // subtle border
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  stock: {
    fontSize: wp('3.3%'),
    color: '#64748b',
    fontWeight: '400',
  },
  priceBox: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  costo: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#0ea5e9',
  },
  unidad: {
    fontSize: wp('3.2%'),
    color: '#64748b',
    fontWeight: '400',
    marginTop: 2,
  },
  // Swipe actions
  quickActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    height: '100%',
    paddingRight: 8,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  quickAction: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 8,
  },
  quickEdit: {
    backgroundColor: 'transparent',
  },
  quickDelete: {
    backgroundColor: 'transparent',
  },
});

export default MaterialItem; 