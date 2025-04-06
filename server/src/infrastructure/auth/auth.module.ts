import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SECRET } from '../../config';
import { UsersModule } from '../../modules/users/users.module';
import { AuthStrategy } from './strategies/auth.strategy';
import { BearerStrategy } from './strategies/bearer.strategy';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

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
