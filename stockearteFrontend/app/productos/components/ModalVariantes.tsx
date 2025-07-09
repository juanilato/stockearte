// Modal para gestionar las variantes de un producto (agregar, editar, eliminar variantes).
// Permite seleccionar y modificar variantes asociadas a un producto.
import CustomToast from '@/components/CustomToast';
import FloatingLabelInput from '@/components/FloatingLabel';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    Modal,
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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Variantes de {producto.nombre}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>
            <View style={styles.body}>
              <FloatingLabelInput
                style={styles.input}
                label="Nombre de la variante"
                placeholder=""
                value={varianteNombre}
                onChangeText={setVarianteNombre}
              />
              <FloatingLabelInput
                style={styles.input}
                label="Stock"
                placeholder=""
                value={varianteStock}
                onChangeText={setVarianteStock}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.saveButton} onPress={guardarVariante}>
                <Text style={styles.saveButtonText}>
                  {varianteSeleccionada ? 'Actualizar' : 'Agregar'} Variante
                </Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Variantes existentes</Text>
              {loading ? (
                <Text style={styles.emptyText}>Cargando...</Text>
              ) : variantes.length === 0 ? (
                <Text style={styles.emptyText}>No hay variantes registradas</Text>
              ) : (
                <View style={styles.variantList}>
                  {variantes.map((item) => (
                    <View key={item.id} style={styles.variantCard}>
                      <View style={styles.variantInfo}>
                        <Text style={styles.variantName}>{item.nombre}</Text>
                        <Text style={styles.variantStock}>Stock: {item.stock}</Text>
                      </View>
                      <View style={styles.variantActions}>
                        <TouchableOpacity onPress={() => editarVariante(item)}>
                          <MaterialCommunityIcons name="pencil" size={20} color="#2563eb" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmarEliminarVariante(item.id!)}>
                          <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
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
