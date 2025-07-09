import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateComponenteDto {
  productoId: number;
  materialId: number;
  cantidad: number;
}

export interface UpdateComponenteDto {
  cantidad?: number;
}

@Injectable()
export class ComponenteService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear componente
  async create(createComponenteDto: CreateComponenteDto) {
    const { productoId, materialId, cantidad } = createComponenteDto;
    
    // Verificar que el producto existe
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId }
    });
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Verificar que el material existe
    const material = await this.prisma.material.findUnique({
      where: { id: materialId }
    });
    
    if (!material) {
      throw new Error('Material no encontrado');
    }

    // Crear el componente
    const componente = await this.prisma.componenteProducto.create({
      data: {
        productoId,
        materialId,
        cantidad,
      },
      include: {
        material: true,
      },
    });

    // Actualizar el costo del producto
    await this.actualizarCostoProducto(productoId);

    return componente;
  }

  // Obtener componentes de un producto
  async findByProducto(productoId: number) {
    return this.prisma.componenteProducto.findMany({
      where: { productoId },
      include: {
        material: true,
      },
    });
  }

  // Obtener componente por ID
  async findOne(id: number) {
    return this.prisma.componenteProducto.findUnique({
      where: { id },
      include: {
        material: true,
      },
    });
  }

  // Actualizar componente
  async update(id: number, updateComponenteDto: UpdateComponenteDto) {
    const componente = await this.prisma.componenteProducto.findUnique({
      where: { id }
    });

    if (!componente) {
      throw new Error('Componente no encontrado');
    }

    const updatedComponente = await this.prisma.componenteProducto.update({
      where: { id },
      data: updateComponenteDto,
      include: {
        material: true,
      },
    });

    // Actualizar el costo del producto
    await this.actualizarCostoProducto(componente.productoId);

    return updatedComponente;
  }

  // Eliminar componente
  async remove(id: number) {
    const componente = await this.prisma.componenteProducto.findUnique({
      where: { id }
    });

    if (!componente) {
      throw new Error('Componente no encontrado');
    }

    const productoId = componente.productoId;

    await this.prisma.componenteProducto.delete({
      where: { id },
    });

    // Actualizar el costo del producto
    await this.actualizarCostoProducto(productoId);

    return { success: true };
  }

  // Función privada para actualizar el costo de un producto
  private async actualizarCostoProducto(productoId: number) {
    const costoTotal = await this.prisma.componenteProducto.aggregate({
      where: { productoId },
      _sum: {
        cantidad: true,
      },
    });

    // Obtener el costo total de los materiales
    const componentes = await this.prisma.componenteProducto.findMany({
      where: { productoId },
      include: {
        material: true,
      },
    });

    let costoTotalCalculado = 0;
    for (const componente of componentes) {
      costoTotalCalculado += componente.cantidad * componente.material.precioCosto;
    }

    // Actualizar el producto
    await this.prisma.producto.update({
      where: { id: productoId },
      data: {
        precioCosto: costoTotalCalculado,
      },
    });
  }
} 