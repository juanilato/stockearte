import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  // Creation of company for a respective user (connected by id) relation User 1:N Company
  create(usuarioId: number, data: any) {
    return this.prisma.empresa.create({
      data: {
        ...data,
        usuario: {
          connect: { id: usuarioId },
        },
      },
    });
  }

  // Find all Companies
  findAll() {
    return this.prisma.empresa.findMany();
  }

  // Find unique companies
  findOne(id: number) {
    return this.prisma.empresa.findUnique({ where: { id } });
  }

  // List name and id of the company desired (select between companies)
  findAllFromUser(usuarioId: number) {

    const result = this.prisma.empresa.findMany({
      where: { usuarioId },
      select: {
        id: true,
        nombreEmpresa: true,
        descripcion: true,
      },
    });
    

    return result;
  }

  // Find all products for the company selected
  findAllProducts(id: number) {
    return this.prisma.producto.findMany({
      where: { empresaId: id },
      include: {
        variantes: true,
        componentes: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  // Find all materials for the company selected
  findAllMaterials(id: number) {
    return this.prisma.material.findMany({
      where: { empresaId: id },
    });
  }

  // Update company data (company name, description)
  update(id: number, data: any) {
    return this.prisma.empresa.update({ where: { id }, data });
  }

  // Delete company
  remove(id: number) {
    return this.prisma.empresa.delete({ where: { id } });
  }
}
