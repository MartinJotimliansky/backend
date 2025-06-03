import { Controller, Post, Body, Param, UnauthorizedException, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';
import { KeycloakAdminAuthGuard } from './guards/keycloak-admin-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}  @Post('login')
  @ApiBody({ type: LoginDto, description: 'Login con usuario y contraseña' })
  @ApiOkResponse({ type: LoginResponseDto })
  async login(
    @Body(new ValidationPipe({
      transform: true,
      whitelist: true,
      validateCustomDecorators: true
    })) body: LoginDto
  ) {
    try {
      console.log('Controller - Recibiendo login:', { 
        username: body.username, 
        password: '****',
        bodyType: typeof body,
        rawBody: JSON.stringify(body)
      });
      
      return await this.authService.login(body);
    } catch (err) {
      console.error('Controller - Error en login:', err);
      throw new UnauthorizedException(err.message || 'Credenciales inválidas');
    }
  }
  @Post('signup')
  @ApiBody({ type: SignupDto, description: 'Registro de usuario usando Keycloak' })
  @ApiCreatedResponse({ description: 'Usuario creado correctamente' })
  async signup(@Body() body: SignupDto) {
    console.log('Datos recibidos en el controlador:', body);
    return await this.authService.signup(body);
  }

  @Post('change-password/:userId')
  @UseGuards(KeycloakAdminAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiParam({ name: 'userId', description: 'ID del usuario en Keycloak' })
  @ApiBody({ type: ChangePasswordDto, description: 'Cambio de contraseña para un usuario (requiere userId de Keycloak)' })
  @ApiNoContentResponse({ description: 'Contraseña cambiada correctamente' })
  async changePassword(
    @Param('userId') userId: string,
    @Body() body: ChangePasswordDto,
    @Req() req: Request
  ): Promise<void> {
    await this.authService.changePassword({ userId, body, req });
  }
}
