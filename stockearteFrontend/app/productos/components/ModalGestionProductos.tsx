import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import FloatingLabelInput from '../../../components/FloatingLabel';
import { useProductos } from '../hooks';
import { useVariantes } from '../hooks/useVariantes';
import { colors } from '../../styles/theme';

interface ModalGestionProductosProps {
  visible: boolean;
  onClose: () => void;
  productosPrecargados?: any[];
  onConfirmarPrecarga?: (productosEditados: any[]) => Promise<void>;
}

export default function ModalGestionProductos({ visible, onClose, productosPrecargados, onConfirmarPrecarga }: ModalGestionProductosProps) {
  const {
    productos,
    actualizarProductoOptimista,
    cargarProductos,
  } = useProductos();
  const { actualizarVariante } = useVariantes();

  const [productosEditados, setProductosEditados] = useState<{ [key: number]: any }>({});
  const [variantesEditadas, setVariantesEditadas] = useState<{ [key: number]: { stock: number } }>({});
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'warning' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar productos precargados o del hook
  const [productosLocal, setProductosLocal] = useState<any[]>([]);
  useEffect(() => {
    if (visible) {
      if (productosPrecargados && productosPrecargados.length > 0) {
        setProductosLocal(productosPrecargados.map(limpiarProducto));
        setToast({ message: 'Editá y confirmá los productos identificados antes de agregarlos', type: 'success' });
      } else {
        setProductosLocal(productos);
      }
    } else {
      setProductosEditados({});
      setVariantesEditadas({});
    }
  }, [visible, productosPrecargados, productos]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const actualizarProductoLocal = (id: number, campo: string, valor: string | number) => {
    const producto = productosLocal.find(p => p.id === id);
    if (!producto || !producto.id) return;
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) || 0 : valor;
    setProductosEditados(prev => {
      const productoId = producto.id as number;
      return {
        ...prev,
        [productoId]: {
          ...producto,
          ...prev[productoId],
          [campo]: valorNumerico
        }
      };
    });
  };

  const actualizarVarianteLocal = (id: number, valor: string | number) => {
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) || 0 : valor;
    setVariantesEditadas(prev => ({
      ...prev,
      [id]: { stock: valorNumerico }
    }));
  };

  const obtenerValorProducto = (producto: any, campo: string) => {
    if (!producto.id) return producto[campo]?.toString() || '';
    const productoId = producto.id as number;
    const editado = productosEditados[productoId];
    if (editado && editado[campo] !== undefined) {
      return editado[campo]?.toString() || '';
    }
    return producto[campo]?.toString() || '';
  };

  const guardarCambios = async () => {
    const productosParaGuardar = Object.values(productosEditados);
    const variantesParaGuardar = Object.entries(variantesEditadas);
    if (productosParaGuardar.length === 0 && variantesParaGuardar.length === 0) return;
    try {
      setIsSaving(true);
      for (const producto of productosParaGuardar) {
        await actualizarProductoOptimista(producto.id, producto);
      }
      for (const [varianteId, varianteData] of variantesParaGuardar) {
        await actualizarVariante(Number(varianteId), varianteData);
      }
      setProductosEditados({});
      setVariantesEditadas({});
      await cargarProductos();
      onClose();
      setToast({ message: 'Cambios guardados correctamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al guardar productos/variantes', type: 'error' });
      console.error('Error al guardar productos/variantes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderProductoItem = ({ item }: { item: any }) => {
    const editado = item.id !== undefined && productosEditados[item.id];
    const tieneVariantes = item.variantes && item.variantes.length > 0;
    const stockBaseEditado = item.id !== undefined && productosEditados[item.id] && productosEditados[item.id].stock !== undefined && productosEditados[item.id].stock !== item.stock;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemInfoContainer}>
          <View style={styles.itemIconContainer}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#0ea5e9" />
          </View>
          <View style={styles.itemDetailsContainer}>
            <Text style={styles.itemNombre}>{item.nombre}</Text>
            {item.codigoBarras && (
              <Text style={styles.itemCodigo}>Código: {item.codigoBarras}</Text>
            )}
            {tieneVariantes && (
              <Text style={styles.itemVariantesInfo}>Este producto tiene variantes. El stock base es independiente.</Text>
            )}
          </View>
          {(editado || stockBaseEditado) && (
            <View style={styles.editIconContainer}>
              <MaterialCommunityIcons name="pencil" size={18} color="#0ea5e9" />
            </View>
          )}
        </View>
        <View style={styles.inputsRow}>
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Precio Venta"
              value={obtenerValorProducto(item, 'precioVenta')}
              onChangeText={(valor: string) => item.id !== undefined && actualizarProductoLocal(item.id, 'precioVenta', valor)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Precio Costo"
              value={obtenerValorProducto(item, 'precioCosto')}
              onChangeText={(valor: string) => item.id !== undefined && actualizarProductoLocal(item.id, 'precioCosto', valor)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label={tieneVariantes ? "Stock base" : "Stock"}
              value={obtenerValorProducto(item, 'stock')}
              onChangeText={(valor: string) => item.id !== undefined && actualizarProductoLocal(item.id, 'stock', valor)}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>
        {tieneVariantes && (
          <View style={styles.variantesListContainer}>
            {item.variantes.map((variante: any) => {
              const varianteEditada = variantesEditadas[variante.id];
              const stockEditado = varianteEditada && varianteEditada.stock !== undefined && varianteEditada.stock !== variante.stock;
              return (
                <View key={variante.id} style={styles.varianteItemContainer}>
                  <View style={styles.varianteInfoRow}>
                    <Text style={styles.varianteNombre}>{variante.nombre}</Text>
                    {stockEditado && (
                      <MaterialCommunityIcons name="pencil" size={16} color="#0ea5e9" style={styles.varianteEditIcon} />
                    )}
                  </View>
                  <FloatingLabelInput
                    label="Stock variante"
                    value={varianteEditada ? varianteEditada.stock?.toString() : variante.stock.toString()}
                    onChangeText={(valor: string) => actualizarVarianteLocal(variante.id, valor)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerInfo}>
                <Text style={styles.modalTitle}>Gestión de Productos</Text>
                <Text style={styles.modalSubtitle}>{productosLocal.length} productos</Text>
              </View>
              <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={productosLocal}
              style={{ flexGrow: 1 }}
              contentContainerStyle={[styles.listContainer, { flexGrow: 1 }]}
              keyExtractor={(item) => item.id?.toString() || ''}
              renderItem={renderProductoItem}
              showsVerticalScrollIndicator={true}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              bounces={true}
              alwaysBounceVertical={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
                  <Text style={styles.emptyText}>No hay productos para mostrar</Text>
                  <Text style={styles.emptySubtext}>
                    Productos recibidos: {productosLocal.length}
                  </Text>
                </View>
              }
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onClose}
                disabled={isSaving}
              >
                <MaterialCommunityIcons name="close" size={20} color={colors.gray[700]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  isSaving && styles.modalButtonDisabled,
                ]}
                onPress={guardarCambios}
                disabled={isSaving}
              >
                <MaterialCommunityIcons name="check-bold" size={20} color="#ffffff" />
                <Text style={styles.modalButtonText}>
                  {isSaving ? 'Guardando...' : ''}
                </Text>
              </TouchableOpacity>
            </View>
            {toast && (
              <View style={{ position: 'absolute', top: 20, left: 0, right: 0, alignItems: 'center', zIndex: 999 }}>
                <Text style={{ backgroundColor: toast.type === 'error' ? '#fee2e2' : '#d1fae5', color: toast.type === 'error' ? '#b91c1c' : '#065f46', padding: 10, borderRadius: 8, fontWeight: '600', fontSize: 15 }}>{toast.message}</Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  modalContent: {
    width: '100%',
    maxWidth: wp('90%'),
    backgroundColor: '#f4f6fa',
    borderRadius: wp('6%'),
    overflow: 'hidden',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  closeIcon: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  listContainer: {
    paddingVertical: 18,
    gap: 10,
  },
  itemContainer: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  itemDetailsContainer: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemCodigo: {
    fontSize: 12,
    color: '#64748b',
  },
  itemVariantesInfo: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '500',
    marginTop: 2,
  },
  editIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#bae6fd',
    elevation: 2,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  variantesListContainer: {
    marginTop: 8,
    paddingLeft: 52,
    gap: 8,
  },
  varianteItemContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  varianteInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  varianteNombre: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  varianteEditIcon: {
    marginLeft: 8,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
    backgroundColor: '#fff',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#0ea5e9',
  },
  modalButtonSecondary: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonTextSecondary: {
    color: '#64748b',
  },
});

function limpiarProducto(prod: any) {
  return {
    ...prod,
    nombre: prod.nombre ?? '',
    precioVenta: prod.precioVenta ?? 0,
    precioCosto: prod.precioCosto ?? 0,
    stock: prod.stock ?? 0,
  };
} 