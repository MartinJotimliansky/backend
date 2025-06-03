import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAdminTokenFromRequest(req: Request): Promise<string> {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No admin token provided');
    }
    return authHeader.split(' ')[1];
  }
  async login(dto: LoginDto) {
    try {
      console.log('Datos de login:', dto);
      
      if (!dto.username || !dto.password) {
        throw new Error('Usuario y contraseña son requeridos');
      }

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

      // Sincroniza usuario local con el token de Keycloak
      await this.syncLocalUserWithKeycloakToken(response.data.access_token, dto);
      return response.data;
    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Usuario o contraseña incorrectos');
      } else if (error.message === 'Usuario y contraseña son requeridos') {
        throw error;
      } else {
        throw new Error('Error al iniciar sesión');
      }
    }
  }

  private async syncLocalUserWithKeycloakToken(accessToken: string, dto: LoginDto) {
    const decoded: any = jwt.decode(accessToken);
    if (decoded && decoded.sub) {
      let user = await this.userRepository.findOne({ where: { id: decoded.sub } });
      if (!user) {
        user = this.userRepository.create({
          id: decoded.sub,
          email: decoded.email,
        });
        await this.userRepository.save(user);
      }
    }
  }
  async signup(dto: SignupDto) {
    try {
      console.log('Datos de registro:', dto);
      if (!dto.username || !dto.email || !dto.password) {
        throw new Error('Faltan datos requeridos');
      }

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
      
      return { message: 'Usuario creado exitosamente' };
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('El usuario o correo ya existe');
      } else if (error.response?.status === 400) {
        throw new Error('Datos inválidos');
      } else if (error.message === 'Faltan datos requeridos') {
        throw error;
      } else {
        console.error('Error en signup:', error);
        throw new Error('Error al crear el usuario');
      }
    }
  }

  async forgotPassword(/* datos de recuperación */) {
    // Implementar recuperación usando Keycloak Admin API
  }

  async changePassword({ userId, body, req }: { userId: string; body: ChangePasswordDto; req: Request }) {
    const keycloak = this.configService.get('yamlConfig.keycloak');
    // Obtener token de admin desde el guard
    const adminToken = (req as any)['adminToken'];
    // Cambiar contraseña (endpoint correcto)
    const url = `${keycloak.url}/admin/realms/${keycloak.realm}/users/${userId}/reset-password`;
    const payload = {
      type: 'password',
      value: body.newPassword,
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
