import { useState } from 'react';
import { estadisticasService, EstadisticasResponse } from '../../../services/api';
import { useEmpresa } from '../../../context/EmpresaContext';

export const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const { selectedEmpresa } = useEmpresa();

  const cargarEstadisticas = async () => {
    try {
      if (!selectedEmpresa) {
        setEstadisticas(null);
        return { dia: 0, mes: 0, anio: 0 };
      }

      const stats = await estadisticasService.getByEmpresa(selectedEmpresa.id);
      
      if (stats) {
        setEstadisticas(stats);
        return stats.ganancias || { dia: 0, mes: 0, anio: 0 };
      } else {
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
      const errorStats = {
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
      setEstadisticas(errorStats);
      return errorStats.ganancias;
    }
  };

  return {
    estadisticas,
    cargarEstadisticas,
  };
}; 