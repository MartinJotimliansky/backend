import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { FightService } from './fight.service';
import { KeycloakLoginAuthGuard } from '../../auth/guards/keycloak-login-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Fights')
@ApiBearerAuth('Bearer')
@Controller('fights')
@UseGuards(KeycloakLoginAuthGuard)
export class FightController {
    constructor(private readonly fightService: FightService) {}
    
    // Endpoints will be implemented later
}
