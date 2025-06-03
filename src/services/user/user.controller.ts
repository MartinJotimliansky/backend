import { Controller, Get, Param, Req, UseGuards, Body, Post, BadRequestException, Patch, Delete, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(UserController.name);
  
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(KeycloakAdminAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Get all users', description: 'Returns a list of all users from Keycloak.' })
  @ApiOkResponse({ type: [UserResponseDto], description: 'List of users.' })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('brutes')
  @UseGuards(KeycloakLoginAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Obtener todos los brutos del usuario', description: 'Devuelve todos los brutos del usuario con sus relaciones principales.' })
  @ApiOkResponse({ type: [BruteResponseDto] })
  async getAllBrutes(@Req() req: Request) {
    try {
      const userJwt = (req as any).user;
      if (!userJwt || !userJwt.sub) {
        throw new BadRequestException('Usuario no autenticado');
      }
      
      const allBrutes = await this.userService.getAllBrutes();
      const user = await this.userService.getUserFromDb(userJwt.sub);
      
      // Filtrar solo los brutos del usuario
      const userBrutes = allBrutes.filter(brute => brute.user.id === userJwt.sub);
      
      return userBrutes.map(brute => ({
        id: brute.id,
        name: brute.name,
        level: brute.level,
        xp: brute.xp,
        gold: brute.gold,
        stats: brute.stats?.[0] ?? null,
        skills: brute.bruteSkills?.map(bs => bs.skill) ?? [],
        weapons: brute.bruteWeapons?.map(bw => bw.weapon) ?? [],
        isSelected: user?.selected_brute_id === brute.id
      }));
    } catch (error) {
      this.logger.error(`Error al obtener brutos: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('brutes')
  @UseGuards(KeycloakLoginAuthGuard)
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  @ApiOperation({ summary: 'Crear un bruto', description: 'Crea un bruto para el usuario logeado. Máximo 5 brutos por usuario.' })
  async createBrute(@Body() body: CreateBruteDto, @Req() req: Request) {
    try {
      this.logger.debug(`Creando bruto con nombre: ${body.name}`);
      const userJwt = (req as any).user;
      if (!userJwt || !userJwt.sub) {
        throw new BadRequestException('Usuario no autenticado');
      }
      const result = await this.userService.createBruteForUser(userJwt.sub, body.name);
      if (result) {
        this.logger.debug(`Bruto creado exitosamente con ID: ${result.id}`);
      } else {
        this.logger.warn('Bruto creado pero el resultado es null');
      }
      return result;
    } catch (error) {
      this.logger.error(`Error al crear bruto: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('brutes/:bruteId')
  @UseGuards(KeycloakLoginAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Obtener bruto completo', description: 'Devuelve stats, habilidades y armas del bruto.' })
  @ApiOkResponse({ type: BruteResponseDto })
  async getBruteById(@Param('bruteId') bruteId: number, @Req() req: Request): Promise<BruteResponseDto> {
    const userJwt = (req as any).user;
    if (!userJwt || !userJwt.sub) {
      throw new BadRequestException('Usuario no autenticado');
    }

    const brute = await this.userService['bruteRepository'].findOne({
      where: { id: bruteId },
      relations: [
        'stats',
        'bruteSkills',
        'bruteSkills.skill',
        'bruteWeapons',
        'bruteWeapons.weapon',
        'user'
      ],
    });

    if (!brute) {
      throw new BadRequestException('Bruto no encontrado');
    }

    if (brute.user.id !== userJwt.sub) {
      throw new BadRequestException('No tienes permiso para ver este bruto');
    }

    const user = await this.userService.getUserFromDb(userJwt.sub);
    
    return {
      id: brute.id,
      name: brute.name,
      level: brute.level,
      xp: brute.xp,
      gold: brute.gold,
      stats: brute.stats?.[0] ?? null,
      skills: brute.bruteSkills?.map(bs => bs.skill) ?? [],
      weapons: brute.bruteWeapons?.map(bw => bw.weapon) ?? [],
      isSelected: user?.selected_brute_id === brute.id
    };
  }

  @Patch('brutes/:bruteId/select')
  @UseGuards(KeycloakLoginAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Seleccionar bruto', description: 'Selecciona el bruto activo del usuario logeado.' })
  async selectBrute(@Param('bruteId') bruteId: number, @Req() req: Request) {
    const userJwt = (req as any).user;
    if (!userJwt || !userJwt.sub) throw new BadRequestException('Usuario no autenticado');
    return this.userService.selectBrute(userJwt.sub, bruteId);
  }

  @Delete('brutes/:bruteId')
  @UseGuards(KeycloakLoginAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Borrar un bruto por ID', description: 'Elimina un bruto y todas sus relaciones por ID.' })
  async deleteBruteById(@Param('bruteId') bruteId: number, @Req() req: Request) {
    const userJwt = (req as any).user;
    if (!userJwt || !userJwt.sub) throw new BadRequestException('Usuario no autenticado');
    
    const brute = await this.userService['bruteRepository'].findOne({
      where: { id: bruteId },
      relations: ['user']
    });

    if (!brute) throw new BadRequestException('Bruto no encontrado');
    if (brute.user.id !== userJwt.sub) throw new BadRequestException('No tienes permiso para borrar este bruto');

    await this.userService.deleteBruteById(bruteId);
    return { message: 'Bruto eliminado' };
  }

  @Post('brutes/generate-10')
  @ApiOperation({ summary: 'Generar 10 brutos randoms', description: 'Crea 10 brutos aleatorios para pruebas y los retorna.' })
  async generate10Brutes() {
    return this.userService.getBruteService().generateRandomBrutesForTesting();
  }

  @Delete('brutes')
  @UseGuards(KeycloakAdminAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Borrar todos los brutos', description: 'Elimina todos los brutos y todas sus relaciones.' })
  async deleteAllBrutes() {
    await this.userService.deleteAllBrutes();
    return { message: 'Todos los brutos eliminados' };
  }

  @Get(':userId')
  @UseGuards(KeycloakLoginAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Get user by ID', description: 'Returns a user from the database.' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User details.' })  async getUserById(@Param('userId') userId: string, @Req() req: Request) {

    const user = await this.userService.getUserFromDb(userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const selectedBrute = user.selected_brute_id ? 
      await this.userService['bruteRepository'].findOne({
        where: { id: user.selected_brute_id },
        relations: ['stats']
      }) : null;

    return {
      id: user.id,
      email: user.email,
      premium_currency: user.premium_currency,
      selected_brute_id: user.selected_brute_id,
      selectedBrute: selectedBrute
    };
  }

}
