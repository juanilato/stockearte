// Hook principal para la gestión de productos: obtención, creación, edición, eliminación y filtrado de productos.
// Maneja estado local, lógica optimista y sincronización con el backend.
import { useState, useEffect, useCallback } from 'react';
import { productoService, Producto, CreateProductoDto, UpdateProductoDto } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Tipo para el toast
export interface ToastType { 
  message: string; 
  type?: 'success' | 'error' | 'warning'; 
}

interface UseProductosProps {
  empresaId?: number;
  onError?: (error: string) => void;
}

export const useProductos = ({ empresaId, onError }: UseProductosProps = {}) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const { user } = useAuth();

  // Cargar productos de la empresa
  const cargarProductos = useCallback(async () => {
    console.log('🔄 Iniciando carga de productos...');
    console.log('📋 empresaId recibido:', empresaId);
    console.log('📋 Tipo de empresaId:', typeof empresaId);
    
    if (!empresaId) {
      console.warn('⚠️ No se proporcionó empresaId para cargar productos');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {

      const productosData = await productoService.getAllByEmpresa(empresaId);


      setProductos(productosData);
 
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar productos';

      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);

    }
  }, [empresaId, onError]);

  // Crear producto con estado optimista
  const crearProductoOptimista = useCallback(async (productoData: Omit<CreateProductoDto, 'empresaId'>) => {
    if (!empresaId) {
      return { success: false, message: 'No se proporcionó empresaId para crear producto' };
    }

    // Generar ID temporal negativo para identificar el producto optimista
    const tempId = -Date.now();
    const productoOptimista: Producto = {
      ...productoData,
      id: tempId,
      empresaId,
    };

    // Agregar inmediatamente al estado local
    setProductos(prev => [productoOptimista, ...prev]);
    setCreatingProduct(true);

    try {
      // Llamar al backend
      const productoReal = await productoService.create({
        ...productoData,
        empresaId,
      });
      
      // Reemplazar el producto optimista con el real
      setProductos(prev => 
        prev.map(p => p.id === tempId ? productoReal : p)
      );
      
      setCreatingProduct(false);
      await cargarProductos();
      return { success: true, message: 'Producto creado exitosamente', producto: productoReal };
    } catch (error: any) {
      // Si falla, remover el producto optimista
      setProductos(prev => prev.filter(p => p.id !== tempId));
      setCreatingProduct(false);
      return { success: false, message: error.message || 'Error al crear producto' };
    }
  }, [empresaId, cargarProductos]);

  // Crear nuevo producto (método original para compatibilidad)
  const crearProducto = useCallback(async (productoData: Omit<CreateProductoDto, 'empresaId'>) => {
    if (!empresaId) {
      throw new Error('No se proporcionó empresaId para crear producto');
    }

    setLoading(true);
    setError(null);
    
    try {
      const nuevoProducto = await productoService.create({
        ...productoData,
        empresaId,
      });
      
      setProductos(prev => [...prev, nuevoProducto]);
      return nuevoProducto;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear producto';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [empresaId, onError]);

  // Actualizar producto con estado optimista
  const actualizarProductoOptimista = useCallback(async (productoId: number, productoData: UpdateProductoDto) => {
    // Actualizar inmediatamente el estado local
    setProductos(prev => 
      prev.map(p => p.id === productoId ? { ...p, ...productoData } : p)
    );

    try {
      // Llamar al backend
      const productoActualizado = await productoService.update(productoId, productoData);
      
      // Reemplazar con la respuesta real del backend
      setProductos(prev => 
        prev.map(p => p.id === productoId ? productoActualizado : p)
      );
      
      await cargarProductos();
      return { success: true, message: 'Producto actualizado exitosamente', producto: productoActualizado };
    } catch (error: any) {
      // Si falla, revertir el estado local
      setProductos(prev => 
        prev.map(p => p.id === productoId ? p : p)
      );
      return { success: false, message: error.message || 'Error al actualizar producto' };
    }
  }, [cargarProductos]);

  // Actualizar producto (método original para compatibilidad)
  const actualizarProducto = useCallback(async (productoId: number, productoData: UpdateProductoDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const productoActualizado = await productoService.update(productoId, productoData);
      
      setProductos(prev => 
        prev.map(p => p.id === productoId ? productoActualizado : p)
      );
      
      return productoActualizado;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar producto';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Eliminar producto
  const eliminarProducto = useCallback(async (productoId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await productoService.delete(productoId);
      
      setProductos(prev => prev.filter(p => p.id !== productoId));
      await cargarProductos();
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar producto';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onError, cargarProductos]);

  // Buscar producto por código de barras
  const buscarProductoPorCodigo = useCallback(async (codigoBarras: string) => {
    try {
      const producto = await productoService.getByBarcode(codigoBarras);
      return producto;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al buscar producto por código';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    }
  }, [onError]);

  // Obtener producto por ID
  const obtenerProductoPorId = useCallback(async (productoId: number) => {
    try {
      const producto = await productoService.getById(productoId);
      return producto;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener producto';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    }
  }, [onError]);

  // Filtrar productos localmente
  const filtrarProductos = useCallback((filtros: {
    nombre?: string;
    costoDesde?: number;
    costoHasta?: number;
    ventaDesde?: number;
    ventaHasta?: number;
    stockDesde?: number;
    stockHasta?: number;
  }) => {
    return productos.filter(producto => {
      const nombreMatch = !filtros.nombre || 
        producto.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
      
      const costoDesdeMatch = !filtros.costoDesde || 
        producto.precioCosto >= filtros.costoDesde;
      
      const costoHastaMatch = !filtros.costoHasta || 
        producto.precioCosto <= filtros.costoHasta;
      
      const ventaDesdeMatch = !filtros.ventaDesde || 
        producto.precioVenta >= filtros.ventaDesde;
      
      const ventaHastaMatch = !filtros.ventaHasta || 
        producto.precioVenta <= filtros.ventaHasta;
      
      const stockDesdeMatch = !filtros.stockDesde || 
        producto.stock >= filtros.stockDesde;
      
      const stockHastaMatch = !filtros.stockHasta || 
        producto.stock <= filtros.stockHasta;
      
      return nombreMatch && costoDesdeMatch && costoHastaMatch && 
             ventaDesdeMatch && ventaHastaMatch && 
             stockDesdeMatch && stockHastaMatch;
    });
  }, [productos]);

  // Cargar productos cuando cambie la empresa
  useEffect(() => {
    if (empresaId) {
      cargarProductos();
    }
  }, [empresaId]);

  return {
    productos,
    loading,
    creatingProduct,
    error,
    cargarProductos,
    crearProductoOptimista,
    crearProducto,
    actualizarProductoOptimista,
    actualizarProducto,
    eliminarProducto,
    buscarProductoPorCodigo,
    obtenerProductoPorId,
    filtrarProductos,
  };
}; 