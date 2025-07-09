// Modal para crear o editar un producto, mostrando un formulario con los campos principales (nombre, precio, stock, etc.).
// Utilizado tanto para alta como para edición de productos.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator
} from 'react-native';
import CustomToast from '../../../components/CustomToast';
import FloatingLabelInput from '../../../components/FloatingLabel';
import { Producto, VarianteProducto } from '../../../services/api';
import { colors } from '../../styles/theme';
import { styles } from '../styles/modals/ModalProducto.styles';
interface Props {
  visible: boolean;
  productoEditado: Producto | null;
  variante?: VarianteProducto;
  codigoNoRegistrado?: string | null;
  onClose: () => void;
  onSubmit: (producto: Producto, esNuevo: boolean) => void;
}

export default function ModalProducto({
  visible,
  onClose,
  onSubmit,
  productoEditado,
  codigoNoRegistrado,
}: Props) {
  const [nombre, setNombre] = useState(''); // Nombre del producto
  const [precioVenta, setPrecioVenta] = useState(''); // Precio de venta del producto
  const [precioCosto, setPrecioCosto] = useState(''); // Precio de costo del producto
  const [stock, setStock] = useState(''); // Stock del producto
  const [loading, setLoading] = useState(false);

  // Efecto para cargar los datos del producto editado al abrir el modal (si no existe, se inicializan los campos)
useEffect(() => {
  if (visible) {
    if (productoEditado) {
      setNombre(productoEditado.nombre);
      setPrecioVenta(productoEditado.precioVenta.toString());
      setPrecioCosto(productoEditado.precioCosto.toString());
      setStock(productoEditado.stock.toString());
    } else {
      setNombre('');
      setPrecioVenta('');
      setPrecioCosto('');
      setStock('');
    }
    setToast(null); // <- limpieza del mensaje anterior
  }
}, [visible, productoEditado]);

  // Todos los campos son obligatorios, si alguno está vacío muestra un alert
  // Realiza validaciones (valores positivos, enteros, != 0, precio costo < precio venta, stock > 0, precio costo >= costo de componentes si tiene)
const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'warning' } | null>(null);

const handleSave = async () => {
  if (!nombre || !precioVenta || !precioCosto || !stock) {
    setToast({ message: 'Por favor complete todos los campos' });
    return;
  }
  // Validar que los campos sean numéricos y convertirlos a números
  const parsedPrecioVenta = parseFloat(precioVenta);
  const parsedPrecioCosto = parseFloat(precioCosto);
  const parsedStock = Number(stock);

  // Validar que los valores sean positivos y enteros
  if (parsedPrecioVenta <= 0 || parsedPrecioCosto <= 0 || parsedStock <= 0) {
    setToast({ message: 'No se permiten valores negativos o cero' });
    return;
  }

  if (!Number.isInteger(parsedStock)) {
    setToast({ message: 'El stock debe ser un número entero sin comas ni decimales' });
    return;
  }

  // Validar que el precio de costo sea menor que el precio de venta
  if (parsedPrecioCosto >= parsedPrecioVenta) {
    setToast({ message: 'El precio de costo debe ser menor que el precio de venta' });
    return;
  }

  // Verificar si el producto tiene componentes y calcular su costo total ( Falta implementar logica)


const producto: Producto = {
  id: productoEditado?.id,
  nombre,
  precioVenta: parsedPrecioVenta,
  precioCosto: parsedPrecioCosto,
  stock: parsedStock,
  codigoBarras: productoEditado?.codigoBarras || undefined,
};

  // Cerrar modal inmediatamente
  onClose();
  
  // Ejecutar la operación en background
  try {
    await onSubmit(producto, !productoEditado);
  } catch (e) {
    setToast({ message: 'Error al guardar producto', type: 'error' });
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {productoEditado ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalBody}>
  <FloatingLabelInput
    label="Nombre"
    value={nombre}
    onChangeText={setNombre}
   
  />
  <FloatingLabelInput
    label="Precio de Costo"
    value={precioCosto}
    onChangeText={setPrecioCosto}
    keyboardType="numeric"
  
  />
  <FloatingLabelInput
    label="Precio de Venta"
    value={precioVenta}
    onChangeText={setPrecioVenta}
    keyboardType="numeric"
   
  />
  <FloatingLabelInput
    label="Stock"
    value={stock}
    onChangeText={setStock}
    keyboardType="numeric"
   
  />
  {codigoNoRegistrado && !productoEditado?.codigoBarras && (
  <FloatingLabelInput
                    label="Código de Barras"
                    value={codigoNoRegistrado}
                    editable={false}
                    style={{ opacity: 0.6 }} onChangeText={function (text: string): void {
                      throw new Error('Function not implemented.');
                    } }  />
)}
</View>

            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onClose}
              >
                <MaterialCommunityIcons name="close" size={20} color={colors.gray[700]} />
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                )}
                <Text style={styles.modalButtonText}>{productoEditado ? 'Guardar Cambios' : 'Crear Producto'}</Text>
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
