import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JwtAuthGuard is used to protect routes that require authentication
// It extends the AuthGuard from Passport, specifying 'jwt' as the strategy
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
