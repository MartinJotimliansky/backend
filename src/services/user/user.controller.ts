import { Controller, Get, Param, Req, UseGuards, Body, Post, BadRequestException, Patch } from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';
import { KeycloakAdminAuthGuard } from '../../auth/guards/keycloak-admin-auth.guard';
import { KeycloakLoginAuthGuard } from '../../auth/guards/keycloak-login-auth.guard';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateBruteDto } from './dto/create-brute.dto';

@ApiTags('Users')
@ApiBearerAuth('Bearer')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(KeycloakAdminAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Get all users', description: 'Returns a list of all users from Keycloak.' })
  @ApiOkResponse({ type: [UserResponseDto], description: 'List of users.' })
  async getAllUsers(@Req() req: Request) {
    const adminToken = (req as any)['adminToken'];
    return this.userService.getAllUsers(adminToken);
  }

  @Get(':userId')
  @UseGuards(KeycloakAdminAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Get user by ID', description: 'Returns a user from Keycloak by their ID.' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User details.' })
  async getUserById(@Param('userId') userId: string, @Req() req: Request) {
    const adminToken = (req as any)['adminToken'];
    return this.userService.getUserById(userId, adminToken);
  }

  @Get('debug-headers')
  @ApiOperation({ summary: 'Debug headers', description: 'Devuelve los headers recibidos en la request para depuración.' })
  async debugHeaders(@Req() req: Request) {
    return {
      headers: req.headers,
      adminToken: (req as any)['adminToken'] || null,
    };
  }

  @Post('brutes')
  @UseGuards(KeycloakLoginAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Crear un bruto', description: 'Crea un bruto para el usuario logeado. Máximo 5 brutos por usuario.' })
  async createBrute(@Body() body: CreateBruteDto, @Req() req: Request) {
    const userJwt = (req as any).user;
    if (!userJwt || !userJwt.sub) throw new BadRequestException('Usuario no autenticado');
    return this.userService.createBruteForUser(userJwt.sub, body.name);
  }

  @Patch('select-brute/:bruteId')
  @UseGuards(KeycloakLoginAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Seleccionar bruto', description: 'Selecciona el bruto activo del usuario logeado.' })
  async selectBrute(@Param('bruteId') bruteId: number, @Req() req: Request) {
    const userJwt = (req as any).user;
    console.log('User JWT:', userJwt.sub);
    if (!userJwt || !userJwt.sub) throw new BadRequestException('Usuario no autenticado');
    return this.userService.selectBrute(userJwt.sub, bruteId);
  }
}
