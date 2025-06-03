import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { BruteService } from './brute.service';
import { KeycloakLoginAuthGuard } from '../../auth/guards/keycloak-login-auth.guard';
import { Brute } from '../../entities/brute/brute.entity';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { BruteResponseDto } from '../user/dto/brute-response.dto';

@ApiTags('Brutes')
@ApiBearerAuth('Bearer')
@Controller('brutes')
@UseGuards(KeycloakLoginAuthGuard)
export class BruteController {
    constructor(private readonly bruteService: BruteService) {}

    @Get(':bruteId')
    @ApiOperation({ summary: 'Get brute by ID', description: 'Returns a brute from the database.' })
    async getBruteById(@Param('bruteId') bruteId: number): Promise<Brute> {
        const brute = await this.bruteService.getBruteById(bruteId);
        if (!brute) throw new BadRequestException('Bruto no encontrado');
        return brute;
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

        return opponents.map(opponent => ({
            id: opponent.id,
            name: opponent.name,
            level: opponent.level,
            xp: opponent.xp,
            gold: opponent.gold,
            stats: opponent.stats?.[0] ?? null,
            skills: opponent.bruteSkills?.map(bs => bs.skill) ?? [],
            weapons: opponent.bruteWeapons?.map(bw => bw.weapon) ?? [],
            isSelected: false // Los oponentes nunca estarán seleccionados para el usuario actual
        }));
    }

    @Delete(':bruteId')
    @ApiOperation({ summary: 'Delete brute', description: 'Deletes a brute from the database.' })
    async deleteBrute(@Param('bruteId') bruteId: number): Promise<void> {
        const brute = await this.bruteService.getBruteById(bruteId);
        if (!brute) throw new BadRequestException('Bruto no encontrado');
        await this.bruteService.deleteBrute(brute);
    }
}
