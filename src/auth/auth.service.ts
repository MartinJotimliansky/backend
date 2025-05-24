import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async getAdminTokenFromRequest(req: Request): Promise<string> {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No admin token provided');
    }
    return authHeader.split(' ')[1];
  }

  async login(dto: LoginDto) {
    const keycloak = this.configService.get('yamlConfig.keycloak');
    const url = `${keycloak.url}/realms/${keycloak.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('client_id', keycloak.clients.login.clientId);
    params.append('client_secret', keycloak.clients.login.secret);
    params.append('grant_type', 'password');
    params.append('username', dto.username);
    params.append('password', dto.password);
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  }

  async signup(dto: SignupDto) {
    const keycloak = this.configService.get('yamlConfig.keycloak');
    // Obtener token de admin
    const urlToken = `${keycloak.url}/realms/${keycloak.realm}/protocol/openid-connect/token`;
    const paramsToken = new URLSearchParams();
    paramsToken.append('client_id', keycloak.clients.admin.clientId);
    paramsToken.append('client_secret', keycloak.clients.admin.secret);
    paramsToken.append('grant_type', 'client_credentials');
    const tokenResponse = await axios.post(urlToken, paramsToken, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const adminToken = tokenResponse.data.access_token;
    // Crear usuario en Keycloak
    const urlCreate = `${keycloak.url}/admin/realms/${keycloak.realm}/users`;
    const userPayload = {
      username: dto.username,
      email: dto.email,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: dto.password,
          temporary: false,
        },
      ],
    };
    await axios.post(urlCreate, userPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    return { message: 'User created' };
  }

  async forgotPassword(/* datos de recuperación */) {
    // Implementar recuperación usando Keycloak Admin API
  }

  async changePassword({ userId, newPassword, req }: { userId: string; newPassword: string; req: Request }) {
    const keycloak = this.configService.get('yamlConfig.keycloak');
    // Obtener token de admin desde el middleware
    const adminToken = await this.getAdminTokenFromRequest(req);
    // Cambiar contraseña (endpoint correcto)
    const url = `${keycloak.url}/admin/realms/${keycloak.realm}/users/${userId}/reset-password`;
    const payload = {
      type: 'password',
      value: newPassword,
      temporary: false,
    };
    await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    return { message: 'Password changed' };
  }
}
