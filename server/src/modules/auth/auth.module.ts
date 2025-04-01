import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BearerStrategy } from './strategies/bearer.strategy';
import { AuthStrategy } from './strategies/auth.strategy';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';
import { SECRET } from '../../config';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [JwtStrategy, BearerStrategy, AuthStrategy, JwtAuthGuard],
  exports: [PassportModule, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
