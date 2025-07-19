import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface EstadisticasResponse {
  ventasTotales: number;
  productosVendidos: number;
  gananciaTotal: number;
  productosMasVendidos: {
    nombre: string;
    cantidad: number;
  }[];
  stockTotal: number;
  productosStockCritico: number;
  gananciaMesActual: number;
  productoMasRentable: {
    nombre: string;
    rentabilidad: number;
  } | null;
  ganancias: {
    dia: number;
    mes: number;
    anio: number;
  };
  ventasMensuales: {
    mes: string;
    total: number;
  }[];
  productosCriticos: {
    id: number;
    nombre: string;
    stock: number;
  }[];
}

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  // Get statistics for a specific company
  async getEstadisticasPorEmpresa(empresaId: number): Promise<EstadisticasResponse> {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

    // Obtain all sales for the company
    const ventas = await this.prisma.venta.findMany({
      where: {
        empresaId: empresaId,
      },
      include: {
        productos: {
          include: {
            producto: true,
          },
        },
      },
    });

    // Obtain all products for the company
    const productos = await this.prisma.producto.findMany({
      where: {
        empresaId: empresaId,
      },
    });

    // Total sales, total products sold, and total profit
    const ventasTotales = ventas.length;
    const gananciaTotal = ventas.reduce((sum, venta) => sum + venta.ganancia, 0);
    const productosVendidos = ventas.reduce((sum, venta) => sum + venta.totalProductos, 0);

    // Calculate total stock
    const stockTotal = productos.reduce((sum, producto) => sum + producto.stock, 0);

    // Calculate products in critical stock (stock <= 5)
    const productosStockCritico = productos.filter(p => p.stock <= 5).length;

    // Obtain critical products for the modal
    const productosCriticos = productos
      .filter(p => p.stock <= 5)
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
      }));

    // Calculate profits by period
    const ventasHoy = ventas.filter(v => {
      const fechaVenta = new Date(v.fecha);
      return fechaVenta.toDateString() === hoy.toDateString();
    });

    const ventasMes = ventas.filter(v => {
      const fechaVenta = new Date(v.fecha);
      return fechaVenta >= inicioMes;
    });

    const ventasAnio = ventas.filter(v => {
      const fechaVenta = new Date(v.fecha);
      return fechaVenta >= inicioAnio;
    });

    const ganancias = {
      dia: ventasHoy.reduce((sum, v) => sum + v.ganancia, 0),
      mes: ventasMes.reduce((sum, v) => sum + v.ganancia, 0),
      anio: ventasAnio.reduce((sum, v) => sum + v.ganancia, 0),
    };

    // Calculate most sold products
    const productosVendidosMap = new Map<string, number>();
    ventas.forEach(venta => {
      venta.productos.forEach(item => {
        const nombre = item.producto.nombre;
        productosVendidosMap.set(nombre, (productosVendidosMap.get(nombre) || 0) + item.cantidad);
      });
    });

    const productosMasVendidos = Array.from(productosVendidosMap.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Calculate most profitable product
    const productosConRentabilidad = productos.map(producto => {
      const ventasProducto = ventas.flatMap(v => v.productos)
        .filter(item => item.productoId === producto.id);
      
      const gananciaTotal = ventasProducto.reduce((sum, item) => sum + item.ganancia, 0);
      const rentabilidad = producto.precioVenta > 0 ? (gananciaTotal / producto.precioVenta) * 100 : 0;
      
      return {
        nombre: producto.nombre,
        rentabilidad,
      };
    });

    const productoMasRentable = productosConRentabilidad.length > 0 
      ? productosConRentabilidad.reduce((max, actual) => 
          actual.rentabilidad > max.rentabilidad ? actual : max
        )
      : null;

    // Calculate monthly sales (last 12 months)
    const ventasMensuales = [];
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      
      const ventasDelMes = ventas.filter(v => {
        const fechaVenta = new Date(v.fecha);
        return fechaVenta.getMonth() === fecha.getMonth() && 
               fechaVenta.getFullYear() === fecha.getFullYear();
      });
      
      const total = ventasDelMes.reduce((sum, v) => sum + v.precioTotal, 0);
      ventasMensuales.push({ mes, total });
    }

    const resultado = {
      ventasTotales,
      productosVendidos,
      gananciaTotal,
      productosMasVendidos,
      stockTotal,
      productosStockCritico,
      gananciaMesActual: ganancias.mes,
      productoMasRentable,
      ganancias,
      ventasMensuales,
      productosCriticos,
    };

    return resultado;
  }
} 