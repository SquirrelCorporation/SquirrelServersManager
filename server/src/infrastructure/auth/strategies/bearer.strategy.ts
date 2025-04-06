import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { IUserRepository, USER_REPOSITORY } from '../../../modules/users';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async validate(token: string) {
    // Find user by API key
    const user = await this.userRepository.findByApiKey(token);
    if (!user) {
      throw new UnauthorizedException('Invalid API key');
    }

    return user;
  }
}
