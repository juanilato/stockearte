import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    // Aquí implementarías la validación del token con el proveedor social
    // Por ahora, simulamos la validación
    const userInfo = await this.validateSocialToken(socialLoginDto);

    // Buscar usuario existente o crear uno nuevo
    let user = await this.prisma.usuario.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      // Crear nuevo usuario
      user = await this.prisma.usuario.create({
        data: {
          email: userInfo.email,
          password: '', // No necesitamos password para login social
          apikeys: [],
        },
      });
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private async validateSocialToken(socialLoginDto: SocialLoginDto) {
    // Aquí implementarías la validación real con cada proveedor
    // Por ahora, simulamos la respuesta
    switch (socialLoginDto.provider) {
      case 'google':
        // Validar con Google API
        return {
          email: socialLoginDto.email,
          name: socialLoginDto.name,
        };
      case 'facebook':
        // Validar con Facebook API
        return {
          email: socialLoginDto.email,
          name: socialLoginDto.name,
        };
      case 'apple':
        // Validar con Apple API
        return {
          email: socialLoginDto.email,
          name: socialLoginDto.name,
        };
      default:
        throw new UnauthorizedException('Invalid social provider');
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
