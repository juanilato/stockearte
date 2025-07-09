import { useState } from 'react';
import { estadisticasService } from '../../../services/api';
import { useEmpresa } from '../../../context/EmpresaContext';
import { MetricasAvanzadas } from '../types';

export const useMetricasAvanzadas = () => {
  const [metricasAvanzadas, setMetricasAvanzadas] = useState<MetricasAvanzadas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedEmpresa } = useEmpresa();

  const cargarMetricasAvanzadas = async () => {
    setIsLoading(true);
    try {
      if (!selectedEmpresa) {
        console.error('No hay empresa seleccionada');
        return;
      }

      const stats = await estadisticasService.getByEmpresa(selectedEmpresa.id);
      
      // Calcular métricas básicas basadas en los datos del backend
      const ticketPromedio = stats.ventasTotales > 0 ? stats.gananciaTotal / stats.ventasTotales : 0;
      const productosPorVenta = stats.ventasTotales > 0 ? stats.productosVendidos / stats.ventasTotales : 0;
      const margenPromedio = stats.gananciaTotal > 0 ? (stats.gananciaTotal / (stats.gananciaTotal + stats.stockTotal)) * 100 : 0;

      const metricas: MetricasAvanzadas = {
        rendimientoVentas: {
          ticketPromedio,
          productosPorVenta,
          horariosPico: [],
          diasActivos: [],
        },
        analisisProductos: {
          masRentables: stats.productosMasVendidos.map(p => ({ nombre: p.nombre, rentabilidad: 0, margen: 0 })),
          mayorRotacion: [],
          estancados: [],
          tendencias: [],
        },
        metricasFinancieras: {
          margenPromedio,
          roi: [],
          flujoCaja: { entradas: stats.gananciaTotal, salidas: 0, balance: stats.gananciaTotal },
          proyeccion: { proximoMes: stats.gananciaMesActual, proximoTresMeses: stats.gananciaMesActual * 3, tendencia: 'estable' },
        },
        analisisInventario: {
          valorTotal: { costo: 0, venta: stats.stockTotal, diferencia: stats.stockTotal },
          proximosAgotarse: stats.productosCriticos.map(p => ({ nombre: p.nombre, stock: p.stock, diasRestantes: 0 })),
          sobrestockeados: [],
          rotacion: { promedio: 0, productos: [] },
        },
        metricasCliente: {
          recurrentes: { total: stats.ventasTotales, porcentaje: 100, nuevos: 0 },
          valorPromedio: ticketPromedio,
          productosPopulares: [{ segmento: 'General', productos: stats.productosMasVendidos.map(p => ({ nombre: p.nombre, ventas: p.cantidad })) }],
        },
      };

      setMetricasAvanzadas(metricas);
    } catch (error) {
      console.error('Error al cargar métricas avanzadas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metricasAvanzadas,
    isLoading,
    cargarMetricasAvanzadas,
  };
}; 