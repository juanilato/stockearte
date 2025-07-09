import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import FloatingLabelInput from '../../../components/FloatingLabel';
import { Material } from '../../../services/api';
import { colors } from '../../styles/theme';
// Estado visible de modal, Material o null (Edicion / Creacion)
// On close, cierra modal
// On Submite, envia datos, esperando respuesta del back 
interface ModalMaterialProps {
  visible: boolean;
  material: Material | null;
  onClose: () => void;
  onSubmit: (nombre: string, precioCosto: string, unidad: string, stock: string) => Promise<{ success: boolean; message: string }>;
}

export default function ModalMaterial({
  visible,
  material,
  onClose,
  onSubmit,
}: ModalMaterialProps) {
  // Estado inicial de los valores 
  const [nombre, setNombre] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [unidad, setUnidad] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'warning' } | null>(null);

  // Si existe material carga los labels con los datos del material, si no vacios.
  useEffect(() => {
    if (visible) {
      if (material) {
        setNombre(material.nombre);
        setPrecioCosto(material.precioCosto.toString());
        setUnidad(material.unidad);
        setStock(material.stock.toString());
      } else {
        setNombre('');
        setPrecioCosto('');
        setUnidad('');
        setStock('');
      }
      setToast(null);
    }
  }, [visible, material]);

  // Guardado de objeto, revisa que:
    //Existan todos los campos
    //Precio costo y stock > 0 Y numéricos
  const handleSubmit = async () => {
    if (!nombre || !precioCosto || !unidad || !stock) {
      setToast({ message: 'Por favor complete todos los campos' });
      return;
    }
    if (parseFloat(precioCosto) <= 0 || parseFloat(stock) < 0) {
      setToast({ message: 'No se permiten valores negativos o cero' });
      return;
    }
    if (!Number.isFinite(Number(stock)) || !Number.isFinite(Number(precioCosto))) {
      setToast({ message: 'Valores inválidos' });
      return;
    }
    
    // Cerrar modal inmediatamente
    onClose();
    
    // Ejecutar la operación en background (guardado de producto)
    try {
      const result = await onSubmit(nombre, precioCosto, unidad, stock);
      if (!result?.success) {
        // Si falla, mostrar toast de error
        setToast({ message: result?.message || 'Error al guardar', type: 'error' });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setToast({ message: 'Error al guardar', type: 'error' });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Header minimalista */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {material ? 'Editar Material' : 'Nuevo Material'}
              </Text>
            </View>

            {/* Body con campos modernos */}
            <View style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Información Básica</Text>
                <FloatingLabelInput
                  label="Nombre del material"
                  value={nombre}
                  onChangeText={setNombre}
                  autoFocus={true}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Precio y Stock</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceField}>
                    <FloatingLabelInput
                      label="Precio de costo"
                      value={precioCosto}
                      onChangeText={setPrecioCosto}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.stockField}>
                    <FloatingLabelInput
                      label="Stock disponible"
                      value={stock}
                      onChangeText={setStock}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Medidas</Text>
                <FloatingLabelInput
                  label="Unidad de medida"
                  value={unidad}
                  onChangeText={setUnidad}
                />
              </View>
            </View>

            {/* Footer minimalista */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onClose}
                disabled={isLoading}
              >
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, isLoading && styles.modalButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialCommunityIcons name="check" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {toast && (
        <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: toast.type === 'error' ? '#ef4444' : '#2563eb', borderRadius: 8, padding: 12, minWidth: 180 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{toast.message}</Text>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },

  modalContent: {
    width: '100%',
    maxWidth: wp('90%'),
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeader: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },

  modalBody: {
    padding: 24,
    backgroundColor: '#ffffff',
  },

  formSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingLeft: 4,
  },

  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },

  priceField: {
    flex: 1,
  },

  stockField: {
    flex: 1,
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },

  modalButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalButtonPrimary: {
    backgroundColor: '#2563eb',
  },

  modalButtonSecondary: {
    backgroundColor: '#f8fafc',
  },

  modalButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
}); 