// Hook que provee handlers de alto nivel para acciones sobre productos (guardar, eliminar, duplicar, ajustar stock).
// Utiliza los métodos optimistas y de backend de useProductos.
import { useCallback } from 'react';
import { Producto, CreateProductoDto, UpdateProductoDto } from '../../../services/api';
import { ToastType } from './useProductos';
import { useProductoUtils } from './useProductoUtils';

interface UseProductoActionsProps {
  crearProductoOptimista: (productoData: Omit<CreateProductoDto, 'empresaId'>) => Promise<any>;
  actualizarProductoOptimista: (productoId: number, productoData: UpdateProductoDto) => Promise<any>;
  eliminarProducto: (productoId: number) => Promise<any>;
  cargarProductos: () => Promise<void>;
  empresaId?: number;
  onError?: (error: string) => void;
}

export const useProductoActions = ({
  crearProductoOptimista,
  actualizarProductoOptimista,
  eliminarProducto,
  cargarProductos,
  empresaId,
  onError,
}: UseProductoActionsProps) => {
  const { generarEAN13, validarProducto } = useProductoUtils();

  // Manejador para guardar productos
  const manejarGuardarProducto = useCallback(async (
    producto: Producto, 
    esNuevo: boolean,
    setToast: (toast: ToastType | null) => void
  ) => {
    try {
      // Validar producto antes de guardar
      const validacion = validarProducto(producto);
      if (!validacion.isValid) {
        setToast({
          type: 'error',
          message: validacion.errors.join(', '),
        });
        return;
      }
      if (esNuevo) {
        const productoData: Omit<CreateProductoDto, 'empresaId'> = {
          nombre: producto.nombre,
          precioCosto: producto.precioCosto,
          precioVenta: producto.precioVenta,
          stock: producto.stock,
          codigoBarras: producto.codigoBarras,
        };
        const result = await crearProductoOptimista(productoData);
        if (result.success) {
          setToast({
            type: 'success',
            message: 'Producto creado correctamente',
          });
        } else {
          setToast({
            type: 'error',
            message: result.message,
          });
        }
      } else {
        if (!producto.id) {
          throw new Error('ID de producto requerido para actualizar');
        }
        const productoData: UpdateProductoDto = {
          nombre: producto.nombre,
          precioCosto: producto.precioCosto,
          precioVenta: producto.precioVenta,
          stock: producto.stock,
          codigoBarras: producto.codigoBarras,
        };
        const result = await actualizarProductoOptimista(producto.id, productoData);
        if (result.success) {
          setToast({
            type: 'success',
            message: 'Producto editado correctamente',
          });
        } else {
          setToast({
            type: 'error',
            message: result.message,
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Error al guardar producto:', error);
      setToast({
        type: 'error',
        message: error.message || 'Hubo un error al guardar el producto.',
      });
    }
  }, [crearProductoOptimista, actualizarProductoOptimista, generarEAN13, validarProducto]);

  // Manejador para eliminar productos
  const manejarEliminarProducto = useCallback(async (
    id: number,
    setToast: (toast: ToastType | null) => void,
    setProductoAEliminar: (producto: Producto | null) => void
  ) => {
    try {
      await eliminarProducto(id);
      await cargarProductos();
      setToast({ type: 'success', message: 'Producto eliminado' });
      setProductoAEliminar(null);
    } catch (error: any) {
      console.error('❌ Error al eliminar producto:', error);
      setToast({
        type: 'error',
        message: error.message || 'Hubo un error al eliminar el producto.',
      });
    }
  }, [eliminarProducto, cargarProductos]);

  // Manejador para duplicar producto
  const manejarDuplicarProducto = useCallback(async (
    producto: Producto,
    setToast: (toast: ToastType | null) => void
  ) => {
    try {
      const productoDuplicado: Omit<CreateProductoDto, 'empresaId'> = {
        nombre: `${producto.nombre} (Copia)`,
        precioCosto: producto.precioCosto,
        precioVenta: producto.precioVenta,
        stock: producto.stock,
        codigoBarras: generarEAN13(), // Nuevo código de barras
      };
      const result = await crearProductoOptimista(productoDuplicado);
      if (result.success) {
        setToast({
          type: 'success',
          message: 'Producto duplicado correctamente',
        });
      } else {
        setToast({
          type: 'error',
          message: result.message,
        });
      }
    } catch (error: any) {
      console.error('❌ Error al duplicar producto:', error);
      setToast({
        type: 'error',
        message: error.message || 'Hubo un error al duplicar el producto.',
      });
    }
  }, [crearProductoOptimista, generarEAN13]);

  // Manejador para ajustar stock
  const manejarAjustarStock = useCallback(async (
    productoId: number,
    nuevoStock: number,
    setToast: (toast: ToastType | null) => void
  ) => {
    try {
      if (nuevoStock < 0) {
        setToast({
          type: 'error',
          message: 'El stock no puede ser negativo',
        });
        return;
      }
      const result = await actualizarProductoOptimista(productoId, { stock: nuevoStock });
      if (result.success) {
        setToast({
          type: 'success',
          message: 'Stock actualizado correctamente',
        });
      } else {
        setToast({
          type: 'error',
          message: result.message,
        });
      }
    } catch (error: any) {
      console.error('❌ Error al ajustar stock:', error);
      setToast({
        type: 'error',
        message: error.message || 'Hubo un error al ajustar el stock.',
      });
    }
  }, [actualizarProductoOptimista]);

  return {
    manejarGuardarProducto,
    manejarEliminarProducto,
    manejarDuplicarProducto,
    manejarAjustarStock,
  };
}; 