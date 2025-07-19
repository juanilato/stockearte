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

  // Validate user credentials
  // It checks if the user exists and if the password matches
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Login method
  // It validates the user credentials and returns a JWT token if valid
  // It also returns user information without the password
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

  // Social login method
  // Not implemented yet, but it accepts a SocialLoginDto
  async socialLogin(socialLoginDto: SocialLoginDto) {

    const userInfo = await this.validateSocialToken(socialLoginDto);

   
    let user = await this.prisma.usuario.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {

      user = await this.prisma.usuario.create({
        data: {
          email: userInfo.email,
          password: '', 
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
// Validate social token
  private async validateSocialToken(socialLoginDto: SocialLoginDto) {

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

  // Verify JWT token
  // It checks if the token is valid and returns user information
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
