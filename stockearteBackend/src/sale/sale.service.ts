import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    // Primero registramos la venta
    const venta = await this.prisma.venta.create({
      data: {
        ...data,
        productos: {
          create:
            data.productos?.map((p: any) => ({
              productoId: p.productoId,
              cantidad: p.cantidad,
              precioUnitario: p.precioUnitario,
              ganancia: p.ganancia,
              varianteId: p.varianteId,
            })) || [],
        },
      },
      include: { productos: true },
    });

    // Después actualizamos el stock de los productos/variantes vendidos
    await this.actualizarStockProductos(data.productos);

    return venta;
  }

  /**
   * Actualiza el stock de los productos y variantes vendidos
   * @param productos - Array de productos vendidos con sus cantidades
   */
  private async actualizarStockProductos(productos: any[]) {
    for (const producto of productos) {
      const { productoId, cantidad, varianteId } = producto;

      if (varianteId) {
        // Si se vendió una variante, restar stock de la variante
        console.log(`📦 Actualizando stock de variante ${varianteId}: -${cantidad}`);
        await this.prisma.varianteProducto.update({
          where: { id: varianteId },
          data: {
            stock: {
              decrement: cantidad
            }
          }
        });
      } else {
        // Si se vendió el producto base, restar stock del producto
        console.log(`📦 Actualizando stock de producto ${productoId}: -${cantidad}`);
        await this.prisma.producto.update({
          where: { id: productoId },
          data: {
            stock: {
              decrement: cantidad
            }
          }
        });
      }
    }
  }

  findAll() {
    return this.prisma.venta.findMany({ include: { productos: true } });
  }

  findOne(id: number) {
    return this.prisma.venta.findUnique({
      where: { id },
      include: { productos: true },
    });
  }

  update(id: number, data: any) {
    return this.prisma.venta.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.venta.delete({ where: { id } });
  }
}
