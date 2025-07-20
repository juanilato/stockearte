import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import FloatingLabelInput from '../../components/FloatingLabel';
import { Material } from '../../../services/api';
import { colors } from '../../../styles/theme';

// Extiende de material con el precio del costo editado
interface MaterialConPrecio extends Material {
  precioCostoEditado: string;
}

interface ModalPreciosMaterialesProps {
  visible: boolean;
  materiales: Material[];
  onClose: () => void;
  onGuardar: (materialesActualizados: Material[]) => Promise<{ success: boolean; message: string }>;
}

// Modal de Actualizacion de muchos precios a la vez en materiales.
  // Estado de visibilidad del modal
  // Materiales listado
  // On close, cerrar modal
  // on guardar, actualización de precios varios
export default function ModalPreciosMateriales({
  visible,
  materiales,
  onClose,
  onGuardar,
}: ModalPreciosMaterialesProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [materialesEditables, setMaterialesEditables] = useState<MaterialConPrecio[]>([]);
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {

    
    if (visible && materiales.length > 0) {
      // Convertir materiales a formato editable
      const materialesConPrecios = materiales.map(material => ({
        ...material,
        precioCostoEditado: material.precioCosto.toString()
      }));
      

      // Setea el listado de materiales
      setMaterialesEditables(materialesConPrecios);

      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (visible) {

      setMaterialesEditables([]);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, materiales]);


  // Actualización de precios en cada material segun su id, y el nuevo precio

  const actualizarPrecio = (id: number, nuevoPrecio: string) => {
    setMaterialesEditables(prev => 
      prev.map(material => 
        material.id === id 
          ? { ...material, precioCostoEditado: nuevoPrecio }
          : material
      )
    );
  };

  // Valida que todos los precios sean válidos
  const handleGuardar = async () => {
    
    const preciosInvalidos = materialesEditables.filter(
      material => !material.precioCostoEditado || isNaN(parseFloat(material.precioCostoEditado))
    );

    if (preciosInvalidos.length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Convertir de vuelta a formato Material
      const materialesActualizados = materialesEditables.map(material => ({
        id: material.id!,
        nombre: material.nombre,
        precioCosto: parseFloat(material.precioCostoEditado),
        unidad: material.unidad,
        stock: material.stock
      }));

      // Una vez convertidos a Material para enviar al back, se ejecuta onGuardar con los materiales con nuevo precio
      const result = await onGuardar(materialesActualizados);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar precios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMaterialItem = ({ item }: { item: MaterialConPrecio }) => {
    const editado = item.precioCostoEditado !== item.precioCosto.toString();
    return (
      <View style={styles.materialCardModern}>
        <View style={styles.materialRowModern}>
          <MaterialCommunityIcons name="cube-outline" size={20} color="#f59e0b" style={{ marginRight: 10 }} />
          <Text style={styles.materialNameModern} numberOfLines={1}>{item.nombre}</Text>
          <Text style={styles.materialUnidadModern}>{item.unidad}</Text>
          <View style={styles.precioContainerModern}>
            <FloatingLabelInput
              label="Precio"
              value={item.precioCostoEditado}
              onChangeText={(text: string) => actualizarPrecio(item.id!, text)}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.inputModern}
            />
          </View>
        </View>
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
          <View style={styles.modalContentModern}>
            <View style={styles.modalHeaderModern}>
              <View style={styles.headerInfoModern}>
                <Text style={styles.modalTitleModern}>Editar Precios</Text>
                <Text style={styles.modalSubtitleModern}>{materialesEditables.length} materiales</Text>
              </View>
              <TouchableOpacity style={styles.closeIconModern} onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={materialesEditables}
              style={{ flexGrow: 1 }}
              contentContainerStyle={[styles.listContainerModern, { flexGrow: 1 }]}
              keyExtractor={(item) => item.id?.toString() || ''}
              renderItem={renderMaterialItem}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separatorModern} />}
              bounces={true}
              alwaysBounceVertical={false}
              ListEmptyComponent={
                <View style={styles.emptyContainerModern}>
                  <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
                  <Text style={styles.emptyTextModern}>No hay materiales para mostrar</Text>
                  <Text style={styles.emptySubtextModern}>
                    Materiales recibidos: {materiales.length}
                  </Text>
                </View>
              }
            />
            <View style={styles.modalFooterModern}>
              <TouchableOpacity
                style={[styles.modalButtonModern, styles.modalButtonSecondaryModern]}
                onPress={onClose}
                disabled={isLoading}
              >
                <MaterialCommunityIcons name="close" size={20} color={colors.gray[700]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButtonModern,
                  styles.modalButtonPrimaryModern,
                  isLoading && styles.modalButtonDisabledModern,
                ]}
                onPress={handleGuardar}
                disabled={isLoading}
              >
                <MaterialCommunityIcons name="check-bold" size={20} color="#ffffff" />
                <Text style={styles.modalButtonTextModern}>
                  {isLoading ? 'Guardando...' : ''}
                </Text>
              </TouchableOpacity>
            </View>
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
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
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
  materialInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  materialDetails: {
    flex: 1,
  },
  materialNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  materialUnidad: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  precioContainer: {
    minWidth: 120,
    marginLeft: 16,
  },
  separator: {
    height: 10,
  },
  editIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#fde68a',
    elevation: 2,
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
    backgroundColor: '#f59e0b',
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
  // Agregar estilos modernos
  modalContentModern: {
    width: '100%',
    maxWidth: wp('92%'),
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
    marginVertical: 32,
    alignSelf: 'center',
  },
  modalHeaderModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 2,
    zIndex: 2,
  },
  headerInfoModern: {
    flex: 1,
  },
  modalTitleModern: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  modalSubtitleModern: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  closeIconModern: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  listContainerModern: {
    paddingVertical: 18,
    gap: 10,
    paddingHorizontal: 8,
  },
  separatorModern: {
    height: 10,
  },
  emptyContainerModern: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTextModern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
  },
  emptySubtextModern: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  modalFooterModern: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  modalButtonModern: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  modalButtonPrimaryModern: {
    backgroundColor: '#f59e0b',
  },
  modalButtonSecondaryModern: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonDisabledModern: {
    opacity: 0.6,
  },
  modalButtonTextModern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Cambios en renderMaterialItem y estilos:
  materialCardModern: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
  },
  materialRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  materialNameModern: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 2,
  },
  materialUnidadModern: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  precioContainerModern: {
    minWidth: 90,
    marginLeft: 8,
  },
  inputModern: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  inputModernText: {
    fontSize: 15,
    color: '#334155',
  },
}); 