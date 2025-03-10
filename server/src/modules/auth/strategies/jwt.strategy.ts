import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { SECRET } from '../../../config';
import { IUserRepository, USER_REPOSITORY } from '../../users';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {
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
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
