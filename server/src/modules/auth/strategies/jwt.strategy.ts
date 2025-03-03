import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { SECRET } from '../../../config';
import UserRepo from '../../../data/database/repository/UserRepo';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        let jwt = null;
        if (req && req.cookies) {
          jwt = req.cookies['jwt'];
        }
        return jwt;
      },
      secretOrKey: SECRET,
    });
  }

  async validate(payload: any) {
    const { expiration, email } = payload;

    // Check if token is expired
    if (Date.now() > expiration) {
      throw new UnauthorizedException('Token expired');
    }

    // Find user by email
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
