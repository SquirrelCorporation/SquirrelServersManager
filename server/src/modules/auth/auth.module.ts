import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportInitService } from './services/passport-init.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule
  ],
  providers: [JwtStrategy, PassportInitService],
  exports: [PassportModule, PassportInitService],
})
export class AuthModule {}
