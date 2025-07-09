// hooks/useNuevaVenta/useProductos.ts
import { useEffect, useState, useCallback } from 'react';
// import { Producto, obtenerProductos, setupProductosDB } from '../../../services/db';
// Ahora importamos el tipo Producto desde la API real:
import { Producto, productoService } from '../../../services/api';
import { useEmpresa } from '../../../context/EmpresaContext';

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedEmpresa } = useEmpresa();

  // Función para cargar productos de la empresa seleccionada
  const cargarProductos = useCallback(async () => {
    console.log('🔄 NuevaVenta: Iniciando carga de productos...');
    console.log('🏢 Empresa seleccionada:', selectedEmpresa);
    
    if (!selectedEmpresa?.id) {
      console.warn('⚠️ NuevaVenta: No hay empresa seleccionada para cargar productos');
      setProductos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🌐 NuevaVenta: Llamando a productoService.getAllByEmpresa...');
      const productosData = await productoService.getAllByEmpresa(selectedEmpresa.id);
      console.log('✅ NuevaVenta: Productos cargados:', productosData.length);
      setProductos(productosData);
    } catch (error) {
      console.error('❌ NuevaVenta: Error cargando productos:', error);
      setProductos([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmpresa?.id]);

  // Cargar productos cuando cambie la empresa seleccionada
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  return {
    productos,
    isLoading,
    setProductos,
    cargarProductos // Exportamos la función para poder recargar si es necesario
  };
};
