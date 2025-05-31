import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakAdminAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    let authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }
    // Si el usuario no incluyó 'Bearer ', prepéndelo automáticamente
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = 'Bearer ' + authHeader;
      request.headers['authorization'] = authHeader;
    }
    const token = authHeader.split(' ')[1];
    const keycloakConfig = this.configService.get('yamlConfig.keycloak');
    const adminClientId = keycloakConfig.clients.admin.clientId;
    const decoded: any = jwt.decode(token);
    if (!decoded || decoded.azp !== adminClientId) {
      throw new UnauthorizedException('Invalid admin token');
    }
    request['adminToken'] = token;
    return true;
  }
}
