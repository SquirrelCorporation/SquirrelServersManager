import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    UsersModule,
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [PassportModule, JwtAuthGuard],
})
export class AuthModule {}
