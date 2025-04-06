import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { SECRET } from '../../config';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const cookies = this.parseCookies(client);

      if (!cookies?.jwt) {
        throw new WsException('No token provided');
      }

      const payload = this.jwtService.verify(cookies.jwt, { secret: SECRET });

      // Check if token is expired
      if (payload.expiration && Date.now() > payload.expiration) {
        throw new WsException('Token expired');
      }

      // Attach decoded payload to socket data for later use
      (client as any).user = payload;

      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private parseCookies(client: Socket): { [key: string]: string } {
    const cookieHeader = client.handshake.headers?.cookie;
    return cookieHeader ? parse(cookieHeader) : {};
  }
}
