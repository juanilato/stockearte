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

  // Create a new component (productoId, materialId, cantidad)
  async create(createComponenteDto: CreateComponenteDto) {
    const { productoId, materialId, cantidad } = createComponenteDto;
    
    // Verify existence of the product
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId }
    });
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Verify existence of the material
    const material = await this.prisma.material.findUnique({
      where: { id: materialId }
    });
    
    if (!material) {
      throw new Error('Material no encontrado');
    }

    // Create component
    // It connects the product with the material and sets the quantity
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

    // Update product cost
    await this.actualizarCostoProducto(productoId);

    return componente;
  }

  // Obtain components of a product
  async findByProducto(productoId: number) {
    return this.prisma.componenteProducto.findMany({
      where: { productoId },
      include: {
        material: true,
      },
    });
  }

  // Obtain one component by its ID
  async findOne(id: number) {
    return this.prisma.componenteProducto.findUnique({
      where: { id },
      include: {
        material: true,
      },
    });
  }

  // Update componente by ID
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

    // Update product cost
    await this.actualizarCostoProducto(componente.productoId);

    return updatedComponente;
  }

  // Deletes component by ID
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

    // Update product cost
    await this.actualizarCostoProducto(productoId);

    return { success: true };
  }

  // Private method to update the product cost based on its components
  // It calculates the total cost based on the quantity and cost of each material
  private async actualizarCostoProducto(productoId: number) {
    const costoTotal = await this.prisma.componenteProducto.aggregate({
      where: { productoId },
      _sum: {
        cantidad: true,
      },
    });

    // obtain all components of the product with their materials
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

    // Update the product
    await this.prisma.producto.update({
      where: { id: productoId },
      data: {
        precioCosto: costoTotalCalculado,
      },
    });
  }
} 