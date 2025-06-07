import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { FightService } from './fight.service';
import { KeycloakLoginAuthGuard } from '../../auth/guards/keycloak-login-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { BattleResultDto } from './dto/battle-result.dto';
import { BattleHistoryDto } from './dto/battle-history.dto';

@ApiTags('Fights')
@ApiBearerAuth('Bearer')
@Controller('fights')
@UseGuards(KeycloakLoginAuthGuard)
export class FightController {
    constructor(private readonly fightService: FightService) {}    @Post('selected-brute/vs/:opponentId')
    @ApiOperation({ summary: 'Iniciar batalla con el bruto seleccionado contra un oponente' })
    @ApiResponse({ status: 200, type: BattleResultDto })
    async fightSelectedBruteVsOpponent(
        @Param('opponentId', ParseIntPipe) opponentId: number,
        @Req() req: Request
    ): Promise<BattleResultDto> {
        const userJwt = (req as any).user;
        const battle = await this.fightService.startBattleWithSelectedBrute(userJwt.sub, opponentId);
        return battle;
    }    @Get(':bruteId/history')
    @ApiOperation({ summary: 'Obtener historial de batallas de un bruto' })
    @ApiResponse({ status: 200, type: [BattleHistoryDto] })
    async getBruteHistory(
        @Param('bruteId', ParseIntPipe) bruteId: number,
        @Req() req: Request
    ): Promise<BattleHistoryDto[]> {
        return this.fightService.getBattleHistory(bruteId);
    }
}
