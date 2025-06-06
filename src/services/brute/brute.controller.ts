import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, BadRequestException, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { BruteService } from './brute.service';
import { KeycloakLoginAuthGuard } from '../../auth/guards/keycloak-login-auth.guard';
import { KeycloakAdminAuthGuard } from '../../auth/guards/keycloak-admin-auth.guard';
import { Brute } from '../../entities/brute/brute.entity';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { BruteResponseDto } from '../user/dto/brute-response.dto';
import { CreateBruteDto } from '../user/dto/create-brute.dto';
import { Logger } from '@nestjs/common';

@ApiTags('Brutes')
@ApiBearerAuth('Bearer')
@Controller('brutes')
@UseGuards(KeycloakLoginAuthGuard)
export class BruteController {
    private readonly logger = new Logger(BruteController.name);
    
    constructor(private readonly bruteService: BruteService) {}

    private calculateBruteRating(brute: Brute): number {
        if (!brute.stats || brute.stats.length === 0) return 0;

        const stats = brute.stats[0];
        const baseStats = stats.strenght + stats.agility + stats.endurance + stats.intelligence;
        const hpBonus = Math.floor(stats.hp / 10);
        const skillBonus = (brute.bruteSkills || []).length * 5;
        const weaponBonus = (brute.bruteWeapons || []).length * 5;
        const levelBonus = brute.level * 10;

        return baseStats + hpBonus + skillBonus + weaponBonus + levelBonus;
    }

    private mapBruteToResponse(brute: Brute, isSelected: boolean = false): BruteResponseDto {
        return {
            id: brute.id,
            name: brute.name,
            level: brute.level,
            xp: brute.xp,
            gold: brute.gold,            rating: this.calculateBruteRating(brute),
            stats: brute.stats?.[0] ?? null,
            skills: brute.bruteSkills?.map(bs => bs.skill) ?? [],
            weapons: brute.bruteWeapons?.map(bw => bw.weapon) ?? [],
            isSelected
        };
    }    @Get('config')
    @ApiOperation({ summary: 'Get brute configuration', description: 'Returns the brute configuration including max_brutes limit.' })
    async getBruteConfig(@Req() req: Request) {
        const userJwt = (req as any).user;
        if (!userJwt || !userJwt.sub) {
            throw new BadRequestException('Usuario no autenticado');
        }

        const config = await this.bruteService.getBruteConfig();
        return {
            max_brutes: config.max_brutes,
            base_hp: config.base_hp,
            weapon_chance: config.weapon_chance
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all brutes of the logged user', description: 'Returns all brutes of the logged user with their main relations.' })
    @ApiOkResponse({ type: [BruteResponseDto] })
    async getAllBrutes(@Req() req: Request) {
        try {
            const userJwt = (req as any).user;
            if (!userJwt || !userJwt.sub) {
                throw new BadRequestException('Usuario no autenticado');
            }
            
            const allBrutes = await this.bruteService.getAllBrutes();
            const user = await this.bruteService.getUserFromDb(userJwt.sub);
            
            const userBrutes = allBrutes.filter(brute => brute.user.id === userJwt.sub);
            
            return userBrutes.map(brute => 
                this.mapBruteToResponse(brute, user?.selected_brute_id === brute.id)
            );
        } catch (error) {
            this.logger.error(`Error getting brutes: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Post()
    @UsePipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    @ApiOperation({ summary: 'Create brute', description: 'Creates a brute for the logged user. Maximum brutes per user is configurable (default 5).' })
    async createBrute(@Body() body: CreateBruteDto, @Req() req: Request) {
        try {
            this.logger.debug(`Creating brute with name: ${body.name}`);
            const userJwt = (req as any).user;
            if (!userJwt || !userJwt.sub) {
                throw new BadRequestException('Usuario no autenticado');
            }
            const brute = await this.bruteService.createBruteForUser(userJwt.sub, body.name);
            if (brute) {
                this.logger.debug(`Brute created successfully with ID: ${brute.id}`);
                return this.mapBruteToResponse(brute);
            } else {
                this.logger.warn('Brute created but result is null');
                return null;
            }
        } catch (error) {
            this.logger.error(`Error creating brute: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get(':bruteId')
    @ApiOperation({ summary: 'Get brute by ID', description: 'Returns a brute from the database.' })
    @ApiOkResponse({ type: BruteResponseDto })
    async getBruteById(@Param('bruteId') bruteId: number, @Req() req: Request): Promise<BruteResponseDto> {
        const userJwt = (req as any).user;
        if (!userJwt || !userJwt.sub) {
            throw new BadRequestException('Usuario no autenticado');
        }

        const brute = await this.bruteService.getBruteById(bruteId);
        if (!brute) {
            throw new BadRequestException('Bruto no encontrado');
        }

        if (brute.user.id !== userJwt.sub) {
            throw new BadRequestException('No tienes permiso para ver este bruto');
        }

        const user = await this.bruteService.getUserFromDb(userJwt.sub);
        return this.mapBruteToResponse(brute, user?.selected_brute_id === brute.id);
    }

    @Get(':bruteId/opponents')
    @ApiOperation({ summary: 'Get brute opponents', description: 'Returns random opponents for the specified brute.' })
    @ApiOkResponse({ type: [BruteResponseDto] })
    async getBruteOpponents(
        @Param('bruteId') bruteId: number,
        @Req() req: Request
    ): Promise<BruteResponseDto[]> {
        const userJwt = (req as any).user;
        if (!userJwt || !userJwt.sub) {
            throw new BadRequestException('Usuario no autenticado');
        }

        const brute = await this.bruteService.getBruteById(bruteId);
        if (!brute) {
            throw new BadRequestException('Bruto no encontrado');
        }

        if (brute.user.id !== userJwt.sub) {
            throw new BadRequestException('No tienes permiso para ver este bruto');
        }

        const opponents = await this.bruteService.getRandomOpponents(bruteId, 6);
        return opponents.map(opponent => this.mapBruteToResponse(opponent, false));
    }

    @Patch(':bruteId/select')
    @ApiOperation({ summary: 'Select brute', description: 'Selects the active brute for the logged user.' })
    async selectBrute(@Param('bruteId') bruteId: number, @Req() req: Request) {
        const userJwt = (req as any).user;
        if (!userJwt || !userJwt.sub) throw new BadRequestException('Usuario no autenticado');
        return this.bruteService.selectBrute(userJwt.sub, bruteId);
    }

    @Delete(':bruteId')
    @ApiOperation({ summary: 'Delete brute', description: 'Deletes a brute from the database.' })
    async deleteBrute(@Param('bruteId') bruteId: number, @Req() req: Request) {
        const userJwt = (req as any).user;
        if (!userJwt || !userJwt.sub) throw new BadRequestException('Usuario no autenticado');
        
        const brute = await this.bruteService.getBruteById(bruteId);
        if (!brute) throw new BadRequestException('Bruto no encontrado');
        if (brute.user.id !== userJwt.sub) throw new BadRequestException('No tienes permiso para borrar este bruto');

        await this.bruteService.deleteBrute(brute);
        return { message: 'Bruto eliminado' };
    }

    @Post('generate-10')
    @ApiOperation({ summary: 'Generate 10 random brutes', description: 'Creates 10 random brutes for testing and returns them.' })
    async generate10Brutes() {
        return this.bruteService.generateRandomBrutesForTesting();
    }

    @Delete()
    @UseGuards(KeycloakAdminAuthGuard)
    @ApiOperation({ summary: 'Delete all brutes', description: 'Deletes all brutes and their relations.' })
    async deleteAllBrutes() {
        await this.bruteService.deleteAllBrutes();
        return { message: 'Todos los brutos eliminados' };
    }

    @Get('current/selected')
    @ApiOperation({ summary: 'Get current selected brute', description: 'Returns the currently selected brute for the logged user.' })
    @ApiOkResponse({ type: BruteResponseDto })
    async getCurrentSelectedBrute(@Req() req: Request): Promise<BruteResponseDto> {
        const userJwt = (req as any).user;
        if (!userJwt || !userJwt.sub) {
            throw new BadRequestException('Usuario no autenticado');
        }

        const user = await this.bruteService.getUserFromDb(userJwt.sub);
        if (!user || !user.selected_brute_id) {
            throw new BadRequestException('No hay un bruto seleccionado');
        }

        const brute = await this.bruteService.getBruteById(user.selected_brute_id);
        if (!brute) {
            throw new BadRequestException('Bruto no encontrado');
        }

        return this.mapBruteToResponse(brute, true);
    }
}
