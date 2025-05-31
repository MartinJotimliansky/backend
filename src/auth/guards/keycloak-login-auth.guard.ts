import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class KeycloakLoginAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    let authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }
    // Permite que el usuario pegue solo el token o el formato Bearer <token>
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = 'Bearer ' + authHeader;
      request.headers['authorization'] = authHeader;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid login token');
      }
      // Inyecta el usuario deserializado en la request
      request['user'] = decoded;
      request['loginToken'] = token;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid login token');
    }
  }
}
