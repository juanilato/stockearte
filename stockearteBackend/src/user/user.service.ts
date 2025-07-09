import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    //Creation of the user
    //Password hashed
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    //Creation of the user in prisma within the data from frontend
    const user = await this.prisma.usuario.create({ data });

    //Return user as creation completed
    return user;
  }

  // Get all users
  findAll() {
    return this.prisma.usuario.findMany();
  }

  // Get user by id
  findOne(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    // 1. Get Actual User from id
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // 2. If Password change we verify prevPassword is pass
    if (data.password) {
      if (!data.prevPassword) {
        throw new ForbiddenException(
          'Debes proporcionar la contraseña anterior',
        );
      }

      // 3. Compare and if it matchs, lets change the Password
      const isMatch = await bcrypt.compare(data.prevPassword, user.password);
      if (!isMatch) {
        throw new ForbiddenException('La contraseña anterior no es correcta');
      }

      // 4. Hash new password
      data.password = await bcrypt.hash(data.password, 10);
    }

    // 5. If API keys are provided, hash them
    if (data.apikeys && Array.isArray(data.apikeys)) {
      const hashedApiKeys = await Promise.all(
        data.apikeys.map(async (apiKey: string) => {
          return await bcrypt.hash(apiKey, 10);
        })
      );
      data.apikeys = hashedApiKeys;
    }

    // 6. Eliminate previous Password
    delete data.prevPassword;

    // 7. Actualice User Data
    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }

  // Delete user by id
  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
