import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SECRET } from '../../config';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [WsAuthGuard],
  exports: [WsAuthGuard, JwtModule],
})
export class WsAuthModule {}
