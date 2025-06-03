import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { UserService } from '../../services/user/user.service';

@Injectable()
export class KeycloakAdminAuthMiddleware implements NestMiddleware {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const keycloak = this.configService.get('yamlConfig.keycloak');
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Obtener el token de admin
      const adminToken = await this.getAdminToken(keycloak);

      // Almacenar el token en el servicio
      this.userService.setAdminToken(adminToken);

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async getAdminToken(keycloak: any): Promise<string> {
    try {
      const tokenUrl = `${keycloak.url}/realms/master/protocol/openid-connect/token`;
      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: keycloak.adminClientId,
          client_secret: keycloak.adminClientSecret,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      return response.data.access_token;
    } catch (error) {
      throw new UnauthorizedException('Failed to get admin token');
    }
  }
}
