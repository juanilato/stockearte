// Modal para gestionar los componentes (materiales) asociados a un producto.
// Permite agregar, editar y eliminar componentes de un producto.
import CustomToast from '@/components/CustomToast';
import FloatingLabelInput from '@/components/FloatingLabel';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import {
  ComponenteProducto,
  Material,
  Producto,
  componenteService,
  CreateComponenteDto,
  materialService
} from '../../../services/api';
import { styles } from '../styles/modals/ModalComponentes.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  producto: Producto;
  onActualizar?: () => void;
}

export default function ModalComponentes({ visible, onClose, producto, onActualizar }: Props) {
  const [componentes, setComponentes] = useState<ComponenteProducto[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [materialesLoading, setMaterialesLoading] = useState(false);
  const [materialesError, setMaterialesError] = useState<string | null>(null);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'warning' } | null>(null);

  // Cargar materiales de la empresa del producto
  const cargarMateriales = async () => {
    if (!producto.empresaId) {
      setMateriales([]);
      setMaterialesError('No se encontró la empresa del producto.');
      return;
    }
    setMaterialesLoading(true);
    setMaterialesError(null);
    try {
      const mats = await materialService.getAllByEmpresa(producto.empresaId);
      setMateriales(mats);
    } catch (err: any) {
      setMaterialesError(err.message || 'Error al cargar materiales');
      setMateriales([]);
    } finally {
      setMaterialesLoading(false);
    }
  };

  // Carga los componentes del producto al abrir el modal
  const cargarComponentes = React.useCallback(async () => {
    try {
      const componentes = await componenteService.getByProducto(producto.id!);
      setComponentes(componentes);
    } catch (error) {
      setToast({ message: 'No se pudieron cargar los componentes', type: 'error' });
      console.error(error);
    }
  }, [producto.id]);

  useEffect(() => {
    if (visible) {
      cargarMateriales();
      cargarComponentes();
      setMaterialSeleccionado(null);
      setCantidad('');
      setToast(null);
    }
  }, [visible, producto.empresaId, cargarComponentes]);

  // Obtiene el costo actual del producto para calcular el nuevo costo al agregar un componente
  // Se usa una función asíncrona para manejar la consulta a la base de datos.
  const obtenerCostoActual = async (): Promise<number> => {
    if (producto.id === undefined) {
      return 0;
    }
    // El costo se calcula automáticamente en el backend cuando se agregan componentes
    return producto.precioCosto || 0;
  };

  // Agrega un nuevo componente al producto
  // Verifica que se haya seleccionado un material y una cantidad válida.
  const agregarComponente = async () => {
    if (!materialSeleccionado || !cantidad) {
      setToast({ message: 'Seleccione un material y cantidad válida', type: 'warning' });
      return;
    }

    // Verifica que la cantidad sea un número válido y mayor a 0
    const cantidadNum = parseFloat(cantidad.replace(',', '.'));
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setToast({ message: 'Cantidad inválida', type: 'warning' });
      return;
    }

    // Calcula el nuevo costo total del producto
    // y verifica que no sea mayor o igual al precio de venta del producto.
    const costoActual = await obtenerCostoActual();
    const nuevoCosto = costoActual + materialSeleccionado.precioCosto * cantidadNum;

    if (nuevoCosto >= producto.precioVenta) {
      setToast({ message: 'El costo total no puede ser mayor o igual al precio de venta', type: 'warning' });
      return;
    }

    try {
      // Inserta el nuevo componente usando la API
      const componenteData: CreateComponenteDto = {
        productoId: producto.id!,
        materialId: materialSeleccionado.id!,
        cantidad: cantidadNum,
      };

      await componenteService.create(componenteData);

      // Recarga los componentes y actualiza el estado
      await cargarComponentes();
      onActualizar?.();
      setCantidad('');
      setMaterialSeleccionado(null);
      setToast({ message: 'Componente agregado correctamente', type: 'success' });

    } catch (error) {
      setToast({ message: 'No se pudo agregar el componente', type: 'error' });
      console.error(error);
    }
  };

  // Elimina un componente del producto
  // Calcula el nuevo costo del producto restando el costo del componente eliminado.
  const eliminarComponente = async (componenteId: number) => {
    const componente = componentes.find(c => c.id === componenteId);
    if (!componente) return;

    const material = materiales.find(m => m.id === componente.materialId);
    if (!material) return;

    const costoActual = await obtenerCostoActual();
    const costoEliminar = material.precioCosto * componente.cantidad;
    const nuevoCosto = Math.max(costoActual - costoEliminar, 0);

    try {
      // Elimina el componente usando la API
      await componenteService.delete(componenteId);
      
      // Recarga los componentes y actualiza el estado
      await cargarComponentes();
      onActualizar?.();
      setToast({ message: 'Componente eliminado correctamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'No se pudo eliminar el componente', type: 'error' });
      console.error(error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Header minimalista */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Componentes de {producto.nombre}
              </Text>
            </View>

            {/* Body con secciones modernas */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Sección de agregar componente */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Agregar Componente</Text>
                
                {materialesLoading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialCommunityIcons name="loading" size={24} color="#6366f1" />
                    <Text style={styles.loadingText}>Cargando materiales...</Text>
                  </View>
                ) : materialesError ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={24} color="#ef4444" />
                    <Text style={styles.errorText}>{materialesError}</Text>
                  </View>
                ) : (!materiales || materiales.length === 0) ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="package-variant" size={48} color="#94a3b8" />
                    <Text style={styles.emptyText}>No hay materiales disponibles</Text>
                    <Text style={styles.emptySubtext}>Agrega materiales a tu empresa primero</Text>
                  </View>
                ) : (
                  <View style={styles.materialSelector}>
                    <Text style={styles.selectorLabel}>Seleccionar Material</Text>
                    <ScrollView style={styles.materialScroll} showsVerticalScrollIndicator={false}>
                      <View style={styles.materialGrid}>
                        {materiales.map((mat) => (
                          <TouchableOpacity
                            key={mat.id}
                            style={[
                              styles.materialCard,
                              materialSeleccionado?.id === mat.id && styles.materialCardSelected,
                            ]}
                            onPress={() => setMaterialSeleccionado(mat)}
                          >
                            <View style={styles.materialIcon}>
                              <MaterialCommunityIcons name="cube-outline" size={14} color="#6366f1" />
                            </View>
                            <Text style={styles.materialName}>{mat.nombre}</Text>
                            <Text style={styles.materialPrice}>${mat.precioCosto}</Text>
                            <Text style={styles.materialUnit}>{mat.unidad}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {materialSeleccionado && (
                  <View style={styles.quantitySection}>
                    <Text style={styles.quantityLabel}>
                      Cantidad en {materialSeleccionado.unidad}
                    </Text>
                    <FloatingLabelInput
                      label="Cantidad"
                      value={cantidad}
                      onChangeText={(text) => {
                        const valid = /^\d*[.,]?\d*$/;
                        if (valid.test(text) || text === '') setCantidad(text);
                      }}
                      keyboardType="decimal-pad"
                    />
                  </View>
                )}
              </View>

              {/* Sección de componentes actuales */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Componentes Actuales</Text>
                
                {componentes.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="puzzle-outline" size={48} color="#94a3b8" />
                    <Text style={styles.emptyText}>No hay componentes</Text>
                    <Text style={styles.emptySubtext}>Agrega componentes para calcular el costo</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.componentScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.componentGrid}>
                      {componentes.map((item) => {
                        const material = materiales.find(m => m.id === item.materialId);
                        if (!material) return null;

                        return (
                          <View key={item.id} style={styles.componentCard}>
                            <View style={styles.componentIcon}>
                              <MaterialCommunityIcons name="cube-outline" size={16} color="#6366f1" />
                            </View>
                            <View style={styles.componentInfo}>
                              <Text style={styles.componentName}>{material.nombre}</Text>
                              <Text style={styles.componentDetails}>
                                {item.cantidad} {material.unidad}
                              </Text>
                            </View>
                            <View style={styles.componentPrice}>
                              <Text style={styles.priceText}>${material.precioCosto * item.cantidad}</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.deleteButton}
                              onPress={() => eliminarComponente(item.id!)}
                            >
                              <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </View>
            </ScrollView>

            {/* Footer con botón moderno */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onClose}
              >
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, (!materialSeleccionado || !cantidad) && styles.modalButtonDisabled]}
                onPress={agregarComponente}
                disabled={!materialSeleccionado || !cantidad}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {toast && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Modal>
  );
}
