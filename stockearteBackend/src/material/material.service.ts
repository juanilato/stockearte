import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMaterialDto {
  nombre: string;
  precioCosto: number;
  unidad: string;
  stock: number;
  empresaId: number;
}

export interface UpdateMaterialDto {
  nombre?: string;
  precioCosto?: number;
  unidad?: string;
  stock?: number;
}

export interface CreateMaterialAndVarianteDto {
  material: CreateMaterialDto;
  productoId: number;
  varianteNombre: string;
  varianteStock: number;
  varianteCodigoBarras?: string;
}

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  // Create material
  async create(createMaterialDto: CreateMaterialDto) {
    const { nombre, precioCosto, unidad, stock, empresaId } = createMaterialDto;
    
    // Verify that the company exists
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId }
    });
    
    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }


    // Create the material
    const material = await this.prisma.material.create({
      data: {
        nombre,
        precioCosto,
        unidad,
        stock,
        empresaId,
      },
    });

    return material;
  }

  // Create material and assign it as a variant to a product
  async createMaterialAndVariante(createData: CreateMaterialAndVarianteDto) {
    const { material, productoId, varianteNombre, varianteStock, varianteCodigoBarras } = createData;

    // Verify that the product exists
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId }
    });
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Verify that the company exists
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: material.empresaId }
    });
    
    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    // Create material and variant in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Create the material
      const nuevoMaterial = await prisma.material.create({
        data: {
          nombre: material.nombre,
          precioCosto: material.precioCosto,
          unidad: material.unidad,
          stock: material.stock,
          empresaId: material.empresaId,
        },
      });

      // 2. Create the variant associated with the product
      const nuevaVariante = await prisma.varianteProducto.create({
        data: {
          productoId,
          nombre: varianteNombre,
          stock: varianteStock,
          codigoBarras: varianteCodigoBarras,
        },
      });

      return {
        material: nuevoMaterial,
        variante: nuevaVariante,
      };
    });

    return result;
  }

  // Get all materials
  async findAll() {
    return this.prisma.material.findMany({
      include: {
        empresa: true,
      },
    });
  }

  // Get materials by company
  async findByEmpresa(empresaId: number) {
    return this.prisma.material.findMany({
      where: { empresaId },
      include: {
        empresa: true,
      },
    });
  }

  // Get material by ID
  async findOne(id: number) {
    return this.prisma.material.findUnique({
      where: { id },
      include: {
        empresa: true,
      },
    });
  }

  // Update material
  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      throw new Error('Material no encontrado');
    }

    const updatedMaterial = await this.prisma.material.update({
      where: { id },
      data: updateMaterialDto,
      include: {
        empresa: true,
      },
    });

    return updatedMaterial;
  }

  // Delete material
  async remove(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      throw new Error('Material no encontrado');
    }

    await this.prisma.material.delete({
      where: { id },
    });

    return { success: true };
  }
}
