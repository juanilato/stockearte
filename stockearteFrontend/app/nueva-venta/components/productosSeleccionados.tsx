// components/NuevaVenta/ProductosSeleccionados.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Producto } from '../../../services/db';
// Ahora importamos el tipo Producto desde la API real:
import { Producto } from '../../../services/api';
import AccionesVenta from './accionesVenta';

// Usamos la definición de ProductoSeleccionado del hook useSeleccionados
import { ProductoSeleccionado } from '../hooks/useSeleccionados';

interface Props {
  productosSeleccionados: ProductoSeleccionado[];
  actualizarCantidad: (productoId: number, nuevaCantidad: number, varianteId?: number) => void;
  quitarProducto: (productoId: number, varianteId?: number) => void;
  calcularTotal: () => number;
  calcularGanancia: () => number;
  onGuardar: () => void;
  onQR: () => void;
}

export default function ProductosSeleccionados({
  productosSeleccionados,
  actualizarCantidad,
  quitarProducto,
  calcularTotal,
  calcularGanancia,
  onGuardar,
  onQR,

}: Props) {
  const renderItem = ({ item }: { item: ProductoSeleccionado }) => (
    <View style={styles.productoCard}>
      <View style={styles.productoInfo}>
        <View style={styles.productoHeader}>
          <Text style={styles.productoNombre} numberOfLines={1}>
            {item.nombre}
          </Text>
          {item.varianteSeleccionada && (
            <View style={styles.varianteBadge}>
              <Text style={styles.varianteText}>{item.varianteSeleccionada.nombre}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productoFooter}>
          <Text style={styles.productoPrecio}>${item.precioVenta}</Text>
          
          <View style={styles.cantidadContainer}>
            <TouchableOpacity
              onPress={() => actualizarCantidad(item.id!, item.cantidad - 1, item.varianteSeleccionada?.id)}
              style={styles.cantidadButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="minus" size={16} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.cantidadText}>{item.cantidad}</Text>
            <TouchableOpacity
              onPress={() => actualizarCantidad(item.id!, item.cantidad + 1, item.varianteSeleccionada?.id)}
              style={styles.cantidadButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => quitarProducto(item.id!, item.varianteSeleccionada?.id)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="close" size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Productos Seleccionados</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{productosSeleccionados.length}</Text>
        </View>
      </View>
      
      <FlatList
        data={productosSeleccionados}
        renderItem={renderItem}
        keyExtractor={item => `${item.id}-${item.varianteSeleccionada?.id || 'base'}`}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cart-outline" size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>No hay productos</Text>
            <Text style={styles.emptySubtext}>Escanea productos para comenzar</Text>
          </View>
        }
      />
      
      {productosSeleccionados.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Productos</Text>
            <Text style={styles.summaryValue}>
              {productosSeleccionados.reduce((total, p) => total + p.cantidad, 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={[styles.summaryValue, styles.totalAmount]}>${calcularTotal()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ganancia</Text>
            <Text style={[styles.summaryValue, styles.gananciaAmount]}>${calcularGanancia()}</Text>
          </View>
        </View>
      )}
      
      <AccionesVenta
        onGuardar={onGuardar}
        onQR={onQR}
        deshabilitado={productosSeleccionados.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  badge: {
    backgroundColor: '#ef4444',
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
  lista: {
    flex: 1,
  },
  productoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productoInfo: {
    flex: 1,
    marginRight: 12,
  },
  productoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  varianteBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  varianteText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  productoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productoPrecio: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '700',
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cantidadButton: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  cantidadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalAmount: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  gananciaAmount: {
    color: '#10b981',
    fontWeight: '700',
  },
});
