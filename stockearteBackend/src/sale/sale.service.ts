import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.venta.create({
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
