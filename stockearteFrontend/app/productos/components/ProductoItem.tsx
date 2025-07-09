// Componente que representa un producto individual en la lista, mostrando información básica y permitiendo acciones rápidas (editar, eliminar, ver componentes, variantes y código de barras) mediante swipe.
// Utilizado en la lista principal de productos.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Producto } from '../../../services/api';

interface ProductoItemProps {
  producto: Producto;
  onEdit?: (producto: Producto) => void;
  onDelete?: (producto: Producto) => void;
  onComponentes?: (producto: Producto) => void;
  onVariantes?: (producto: Producto) => void;
  onShowBarcode?: (producto: Producto) => void;
}

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

function SwipeLeftActions({ item, onComponentes, onVariantes, onShowBarcode }: any) {
  return (
    <View style={styles.quickActionsContainerLeft}>
      <TouchableOpacity
        style={[styles.quickAction, styles.quickBarcode]}
        onPress={() => onShowBarcode(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="barcode" size={22} color="#f59e42" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quickAction, styles.quickComponentes]}
        onPress={() => onComponentes(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="tools" size={22} color="#2563eb" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quickAction, styles.quickVariantes]}
        onPress={() => onVariantes(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="shape-plus" size={22} color="#10b981" />
      </TouchableOpacity>
    </View>
  );
}

export default function ProductoItem({ producto, onEdit, onDelete, onComponentes, onVariantes, onShowBarcode }: ProductoItemProps) {
  const margen = producto.precioVenta && producto.precioCosto
    ? (parseFloat(producto.precioVenta.toString()) - parseFloat(producto.precioCosto.toString())).toFixed(2)
    : '0.00';

  const margenPorcentaje = producto.precioVenta && producto.precioCosto && producto.precioCosto > 0
    ? ((parseFloat(producto.precioVenta.toString()) - parseFloat(producto.precioCosto.toString())) / parseFloat(producto.precioCosto.toString()) * 100).toFixed(1)
    : '0';

  const stockStatus = producto.stock <= 5 ? 'critical' : producto.stock <= 15 ? 'low' : 'good';

  return (
    <View style={styles.productoWrapper}>
      <Swipeable
        renderRightActions={() => (
          <SwipeActions item={producto} onEdit={onEdit} onDelete={onDelete} />
        )}
        renderLeftActions={() => (
          <SwipeLeftActions item={producto} onComponentes={onComponentes} onVariantes={onVariantes} onShowBarcode={onShowBarcode} />
        )}
        overshootRight={false}
        overshootLeft={false}
        friction={2}
        rightThreshold={40}
        leftThreshold={40}
      >
        <View style={styles.productoCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="package-variant" size={24} color="#6366f1" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.nombre}>{producto.nombre}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.stockBadge, styles[`stockBadge${stockStatus}`]]}>
                  <MaterialCommunityIcons 
                    name={stockStatus === 'critical' ? 'alert-circle' : stockStatus === 'low' ? 'alert' : 'check-circle'} 
                    size={12} 
                    color={stockStatus === 'critical' ? '#ffffff' : stockStatus === 'low' ? '#ffffff' : '#ffffff'} 
                  />
                  <Text style={styles.stockBadgeText}>{producto.stock}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Venta</Text>
                <Text style={styles.venta}>${producto.precioVenta}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Costo</Text>
                <Text style={styles.costo}>${producto.precioCosto}</Text>
              </View>
            </View>
            
            <View style={styles.marginContainer}>
              <Text style={styles.marginLabel}>Margen</Text>
              <View style={styles.marginValueContainer}>
                <Text style={styles.margen}>${margen}</Text>
                <Text style={styles.margenPorcentaje}>({margenPorcentaje}%)</Text>
              </View>
            </View>
          </View>
        </View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  productoWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  productoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nombre: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 12,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    justifyContent: 'center',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: wp('3.2%'),
    color: '#64748b',
    fontWeight: '500',
  },
  venta: {
    fontSize: wp('4.2%'),
    fontWeight: '700',
    color: '#0ea5e9',
  },
  costo: {
    fontSize: wp('3.8%'),
    color: '#64748b',
    fontWeight: '500',
  },
  marginContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  marginLabel: {
    fontSize: wp('3.2%'),
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  marginValueContainer: {
    alignItems: 'flex-end',
  },
  margen: {
    fontSize: wp('4%'),
    color: '#10b981',
    fontWeight: '700',
  },
  margenPorcentaje: {
    fontSize: wp('3%'),
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  // Swipe actions
  quickActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    height: '100%',
    paddingRight: 12,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAction: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickEdit: {
    backgroundColor: '#ffffff',
  },
  quickDelete: {
    backgroundColor: '#ffffff',
  },
  quickActionsContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    height: '100%',
    paddingLeft: 12,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickComponentes: {
    backgroundColor: '#ffffff',
  },
  quickVariantes: {
    backgroundColor: '#ffffff',
  },
  quickBarcode: {
    backgroundColor: '#ffffff',
  },
}); 