import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { SECRET } from '../../../config';
import { IUserRepository, USER_REPOSITORY } from '../../../modules/users';

/**
 * Custom strategy that tries multiple authentication methods in sequence:
 * 1. JWT token from cookies
 * 2. Bearer token from Authorization header (API key)
 */
@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth') {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {
    super();
  }

  async validate(req: Request) {
    // Try JWT auth first
    if (req.cookies && req.cookies['jwt']) {
      try {
        const payload = this.jwtService.verify(req.cookies['jwt'], {
          secret: SECRET,
        });

        // Check if token is expired
        if (payload.expiration && Date.now() > payload.expiration) {
          throw new UnauthorizedException('Token expired');
        }

        // Find user by email
        const user = await this.userRepository.findByEmail(payload.email);
        if (user) {
          return user;
        }
      } catch (e) {
        // JWT validation failed, continue to next auth method
      }
    }

    // Try Bearer token auth
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await this.userRepository.findByApiKey(token);
      if (user) {
        return user;
      }
    }

    // No authentication method succeeded
    throw new UnauthorizedException('Authentication failed');
  }
}
