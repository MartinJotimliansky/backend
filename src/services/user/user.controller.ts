import { Controller, Get, Param, Req, UseGuards, Body, Post, BadRequestException, Patch, Delete } from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';
import { KeycloakAdminAuthGuard } from '../../auth/guards/keycloak-admin-auth.guard';
import { KeycloakLoginAuthGuard } from '../../auth/guards/keycloak-login-auth.guard';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateBruteDto } from './dto/create-brute.dto';
import { BruteResponseDto } from './dto/brute-response.dto';
import { Brute } from '../../entities/brute/brute.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { BruteSkill } from '../../entities/brute/brute_skill.entity';
import { BruteWeapon } from '../../entities/brute/brute_weapon.entity';

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

  @Get('brutes/:bruteId')
  @ApiOperation({ summary: 'Obtener bruto completo', description: 'Devuelve stats, habilidades y armas del bruto.' })
  @ApiOkResponse({ type: BruteResponseDto })
  async getBruteById(@Param('bruteId') bruteId: number): Promise<BruteResponseDto> {
    // Buscar bruto y relaciones
    const brute = await this.userService['bruteRepository'].findOne({
      where: { id: bruteId },
      relations: [
        'stats',
        'bruteSkills',
        'bruteSkills.skill',
        'bruteWeapons',
        'bruteWeapons.weapon',
      ],
    });
    if (!brute) throw new BadRequestException('Bruto no encontrado');
    return {
      id: brute.id,
      name: brute.name,
      level: brute.level,
      xp: brute.xp,
      gold: brute.gold,
      stats: brute.stats?.[0] ?? null,
      skills: brute.bruteSkills?.map(bs => bs.skill) ?? [],
      weapons: brute.bruteWeapons?.map(bw => bw.weapon) ?? [],
    };
  }

  @Post('brutes/generate-10')
  @ApiOperation({ summary: 'Generar 10 brutos randoms', description: 'Crea 10 brutos aleatorios para pruebas y los retorna.' })
  async generate10Brutes() {
    return this.userService.getBruteService().generateRandomBrutesForTesting();
  }

  @Get('brutes')
  @ApiOperation({ summary: 'Obtener todos los brutos', description: 'Devuelve todos los brutos con sus relaciones principales.' })
  @ApiOkResponse({ type: [BruteResponseDto] })
  async getAllBrutes() {
    return this.userService.getAllBrutes();
  }

  @Delete('brutes/:bruteId')
  @ApiOperation({ summary: 'Borrar un bruto por ID', description: 'Elimina un bruto y todas sus relaciones por ID.' })
  async deleteBruteById(@Param('bruteId') bruteId: number) {
    await this.userService.deleteBruteById(bruteId);
    return { message: 'Bruto eliminado' };
  }

  @Delete('brutes')
  @ApiOperation({ summary: 'Borrar todos los brutos', description: 'Elimina todos los brutos y todas sus relaciones.' })
  async deleteAllBrutes() {
    await this.userService.deleteAllBrutes();
    return { message: 'Todos los brutos eliminados' };
  }
}
