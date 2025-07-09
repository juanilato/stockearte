// Modal para gestionar las variantes de un producto (agregar, editar, eliminar variantes).
// Permite seleccionar y modificar variantes asociadas a un producto.
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
import { Producto } from '../../../services/api';
import { useVariantes } from '../hooks/useVariantes';
import { styles } from '../styles/modals/ModalVariantes.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  producto: Producto;
  onActualizar?: () => void;
}

export default function ModalVariantes({ visible, onClose, producto, onActualizar }: Props) {
  const [varianteNombre, setVarianteNombre] = useState('');
  const [varianteStock, setVarianteStock] = useState('');
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'warning' } | null>(null);

  const {
    variantes,
    cargarVariantes,
    crearVariante,
    actualizarVariante,
    eliminarVariante,
    loading,
    error,
  } = useVariantes(producto.id);

  useEffect(() => {
    if (visible) {
      cargarVariantes();
      setVarianteNombre('');
      setVarianteStock('');
      setVarianteSeleccionada(null);
      setToast(null);
    }
  }, [visible, producto.id, cargarVariantes]);

  const generarEAN13 = (): string => {
    const base = Math.floor(100000000000 + Math.random() * 899999999999).toString();
    const checkDigit = calcularDigitoControlEAN13(base);
    return base + checkDigit;
  };

  const calcularDigitoControlEAN13 = (codigo: string): string => {
    const nums = codigo.split('').map(n => parseInt(n));
    let sum = 0;
    for (let i = 0; i < nums.length; i++) {
      sum += i % 2 === 0 ? nums[i] : nums[i] * 3;
    }
    const remainder = sum % 10;
    const check = remainder === 0 ? 0 : 10 - remainder;
    return check.toString();
  };

  const guardarVariante = async () => {
    if (!varianteNombre || !varianteStock) {
      setToast({ message: 'Todos los campos son obligatorios', type: 'warning' });
      return;
    }
    if (parseInt(varianteStock) <= 0) {
      setToast({ message: 'El stock debe ser un número positivo', type: 'warning' });
      return;
    }
    try {
      if (varianteSeleccionada) {
        await actualizarVariante(varianteSeleccionada.id, {
          nombre: varianteNombre,
          stock: parseInt(varianteStock),
        });
        setToast({ message: 'Variante actualizada correctamente', type: 'success' });
      } else {
        await crearVariante({
          productoId: producto.id!,
          nombre: varianteNombre,
          stock: parseInt(varianteStock),
          codigoBarras: undefined,
        });
        setToast({ message: 'Variante agregada correctamente', type: 'success' });
      }
      setVarianteNombre('');
      setVarianteStock('');
      setVarianteSeleccionada(null);
      onActualizar?.();
      await cargarVariantes();
    } catch (error) {
      setToast({ message: 'No se pudo guardar la variante', type: 'error' });
    }
  };

  const confirmarEliminarVariante = async (id: number) => {
    try {
      await eliminarVariante(id);
      onActualizar?.();
      setToast({ message: 'Variante eliminada correctamente', type: 'success' });
      await cargarVariantes();
    } catch (error) {
      setToast({ message: 'No se pudo eliminar la variante', type: 'error' });
    }
  };

  const editarVariante = (variante: any) => {
    setVarianteSeleccionada(variante);
    setVarianteNombre(variante.nombre);
    setVarianteStock(variante.stock.toString());
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
                Variantes de {producto.nombre}
              </Text>
            </View>

            {/* Body con secciones modernas */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Sección de agregar variante */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Agregar Variante</Text>
                
                <View style={styles.inputRow}>
                  <View style={styles.inputField}>
                    <FloatingLabelInput
                      label="Nombre de la variante"
                      value={varianteNombre}
                      onChangeText={setVarianteNombre}
                    />
                  </View>
                  <View style={styles.inputField}>
                    <FloatingLabelInput
                      label="Stock"
                      value={varianteStock}
                      onChangeText={setVarianteStock}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Sección de variantes existentes */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Variantes Existentes</Text>
                
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialCommunityIcons name="loading" size={24} color="#6366f1" />
                    <Text style={styles.loadingText}>Cargando variantes...</Text>
                  </View>
                ) : variantes.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="tag-outline" size={48} color="#94a3b8" />
                    <Text style={styles.emptyText}>No hay variantes</Text>
                    <Text style={styles.emptySubtext}>Agrega variantes para organizar tu inventario</Text>
                  </View>
                ) : (
                  <View style={styles.variantList}>
                    {variantes.map((item) => (
                      <View key={item.id} style={styles.variantCard}>
                        <View style={styles.variantIcon}>
                          <MaterialCommunityIcons name="tag-outline" size={20} color="#6366f1" />
                        </View>
                        <View style={styles.variantInfo}>
                          <Text style={styles.variantName}>{item.nombre}</Text>
                          <Text style={styles.variantStock}>Stock: {item.stock}</Text>
                        </View>
                        <View style={styles.variantActions}>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => editarVariante(item)}
                          >
                            <MaterialCommunityIcons name="pencil" size={18} color="#2563eb" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => confirmarEliminarVariante(item.id!)}
                          >
                            <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Footer con botones modernos */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onClose}
              >
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, (!varianteNombre || !varianteStock) && styles.modalButtonDisabled]}
                onPress={guardarVariante}
                disabled={!varianteNombre || !varianteStock}
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
