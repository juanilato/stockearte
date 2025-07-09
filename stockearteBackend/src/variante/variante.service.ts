import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUniqueEAN13, isEAN13AvailableInEmpresa } from '../utils/ean13.util';

export interface CreateVarianteDto {
  productoId: number;
  nombre: string;
  stock: number;
  codigoBarras?: string;
}

export interface UpdateVarianteDto {
  nombre?: string;
  stock?: number;
  codigoBarras?: string;
}

@Injectable()
export class VarianteService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear variante
  async create(createVarianteDto: CreateVarianteDto) {

    const { productoId, nombre, stock } = createVarianteDto;
    let { codigoBarras } = createVarianteDto;
    
    // Verificar que el producto existe
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId }
    });


    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Si no se pasa código de barras, generar uno único para la empresa
    if (!codigoBarras) {
      codigoBarras = await generateUniqueEAN13(this.prisma, producto.empresaId);
    } else {
      const disponible = await isEAN13AvailableInEmpresa(this.prisma, codigoBarras, producto.empresaId);
      if (!disponible) {
        throw new Error('El código de barras ya existe en productos o variantes de la empresa');
      }
    }

    // Crear la variante
    const variante = await this.prisma.varianteProducto.create({
      data: {
        productoId,
        nombre,
        stock,
        codigoBarras,
      },
    });

    return variante;
  }

  // Obtener todas las variantes
  async findAll() {
    return this.prisma.varianteProducto.findMany({
      include: {
        producto: true,
      },
    });
  }

  // Obtener variantes de un producto
  async findByProducto(productoId: number) {
    return this.prisma.varianteProducto.findMany({
      where: { productoId },
    });
  }

  // Obtener variante por ID
  async findOne(id: number) {
    return this.prisma.varianteProducto.findUnique({
      where: { id },
    });
  }

  // Actualizar variante
  async update(id: number, updateVarianteDto: UpdateVarianteDto) {
    const variante = await this.prisma.varianteProducto.findUnique({
      where: { id }
    });

    if (!variante) {
      throw new Error('Variante no encontrada');
    }

    const updatedVariante = await this.prisma.varianteProducto.update({
      where: { id },
      data: updateVarianteDto,
    });

    return updatedVariante;
  }

  // Eliminar variante
  async remove(id: number) {
    const variante = await this.prisma.varianteProducto.findUnique({
      where: { id }
    });

    if (!variante) {
      throw new Error('Variante no encontrada');
    }

    await this.prisma.varianteProducto.delete({
      where: { id },
    });

    return { success: true };
  }
} 