// components/NuevaVenta/ProductosDisponibles.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Producto } from '../../../services/db';
// Ahora importamos el tipo Producto desde la API real:
import { Producto } from '../../../services/api';

interface Props {
  productos: Producto[];
  onAgregar: (producto: Producto) => void;
  onSeleccionarProducto?: (producto: Producto) => void;
}

export default function ProductosDisponibles({ productos, onAgregar, onSeleccionarProducto }: Props) {
  const renderItem = ({ item }: { item: Producto }) => (
    <TouchableOpacity
      style={styles.productoCard}
      onPress={() => {
        if (onSeleccionarProducto && item.variantes && item.variantes.length > 0) {
          onSeleccionarProducto(item);
        } else {
          onAgregar(item);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.productoHeader}>
        <Text style={styles.productoNombre} numberOfLines={2}>{item.nombre}</Text>
        {item.variantes && item.variantes.length > 0 && (
          <View style={styles.variantesBadge}>
            <Text style={styles.variantesText}>{item.variantes.length}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productoFooter}>
        <Text style={styles.productoPrecio}>${item.precioVenta}</Text>
        
        <View style={styles.stockContainer}>
          <MaterialCommunityIcons 
            name={item.variantes && item.variantes.length > 0 ? "package-variant" : "package-variant-closed"} 
            size={12} 
            color="#64748b" 
          />
          <Text style={styles.productoStock}>
            {item.variantes && item.variantes.length > 0
              ? `${item.variantes.length} variante${item.variantes.length !== 1 ? 's' : ''}`
              : `${item.stock} unidades`}
          </Text>
        </View>
      </View>
      
      <View style={styles.addButton}>
        <MaterialCommunityIcons name="plus" size={14} color="#3b82f6" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Productos Disponibles</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{productos.length}</Text>
        </View>
      </View>
      
      <FlatList
        data={productos}
        renderItem={renderItem}
        keyExtractor={item => item.id?.toString() || ''}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>No hay productos</Text>
            <Text style={styles.emptySubtext}>Agrega productos desde el catálogo</Text>
          </View>
        }
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    backgroundColor: '#3b82f6',
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
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  productoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productoNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    lineHeight: 16,
  },
  variantesBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 16,
    alignItems: 'center',
  },
  variantesText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  productoFooter: {
    flexDirection: 'column',
    gap: 4,
  },
  productoPrecio: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '700',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  productoStock: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#dbeafe',
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
});
