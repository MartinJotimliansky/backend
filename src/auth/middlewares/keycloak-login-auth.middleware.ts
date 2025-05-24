import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

@Injectable()
export class KeycloakLoginAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    let token = authHeader.split(' ')[1];
    const keycloakConfig = this.configService.get('yamlConfig.keycloak');
    const loginClientId = keycloakConfig.clients.login.clientId;
    let decoded: any = jwt.decode(token);
    if (!decoded || decoded.azp !== loginClientId) {
      throw new UnauthorizedException('Invalid login token');
    }
    // Verifica expiración y refresca si es necesario
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      // Intenta refrescar el token usando el refresh_token del header
      const refreshToken = req.headers['x-refresh-token'] as string;
      if (!refreshToken) {
        throw new UnauthorizedException('Token expired and no refresh token provided');
      }
      try {
        const url = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
        const params = new URLSearchParams();
        params.append('client_id', loginClientId);
        params.append('client_secret', keycloakConfig.clients.login.secret);
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);
        const response = await axios.post(url, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        token = response.data.access_token;
        // Opcional: pasar el nuevo token al request para el resto de la app
        req.headers['authorization'] = `Bearer ${token}`;
        if (response.data.refresh_token) {
          req.headers['x-refresh-token'] = response.data.refresh_token;
        }
        decoded = jwt.decode(token);
      } catch (err) {
        throw new UnauthorizedException('Refresh token invalid or expired');
      }
    }
    next();
  }
}
