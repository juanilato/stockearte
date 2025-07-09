import { useState } from 'react';
import { estadisticasService, EstadisticasResponse } from '../../../services/api';
import { useEmpresa } from '../../../context/EmpresaContext';

export const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const { selectedEmpresa } = useEmpresa();

  const cargarEstadisticas = async () => {
    try {
      console.log('🏢 useEstadisticas - selectedEmpresa:', selectedEmpresa);
      
      if (!selectedEmpresa) {
        console.error('❌ useEstadisticas - No hay empresa seleccionada');
        return { dia: 0, mes: 0, anio: 0 };
      }

      console.log('🏢 useEstadisticas - Llamando API con empresaId:', selectedEmpresa.id);
      const stats = await estadisticasService.getByEmpresa(selectedEmpresa.id);
      console.log('✅ useEstadisticas - Estadísticas cargadas:', stats);
      
      // Verificar si hay datos válidos
      if (stats && (stats.ventasTotales > 0 || stats.stockTotal > 0)) {
        setEstadisticas(stats);
        return stats.ganancias;
      } else {
        console.log('📊 useEstadisticas - No hay datos de ventas, estableciendo estadísticas vacías');
        const emptyStats = {
          ventasTotales: 0,
          productosVendidos: 0,
          gananciaTotal: 0,
          productosMasVendidos: [],
          stockTotal: 0,
          productosStockCritico: 0,
          gananciaMesActual: 0,
          productoMasRentable: null,
          ganancias: { dia: 0, mes: 0, anio: 0 },
          ventasMensuales: [],
          productosCriticos: [],
        };
        setEstadisticas(emptyStats);
        return emptyStats.ganancias;
      }
    } catch (error) {
      console.error('❌ useEstadisticas - Error al cargar estadísticas:', error);
      return { dia: 0, mes: 0, anio: 0 };
    }
  };

  return {
    estadisticas,
    cargarEstadisticas,
  };
}; 