import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakAdminAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const keycloakConfig = this.configService.get('yamlConfig.keycloak');
    const adminClientId = keycloakConfig.clients.admin.clientId;
    const decoded: any = jwt.decode(token);
    if (!decoded || decoded.azp !== adminClientId) {
      throw new UnauthorizedException('Invalid admin token');
    }
    next();
  }
}
