import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LevelService } from './level.service';
import { LevelUpRequestDto } from './dto/level-up-request.dto';
import { LevelInfoDto } from './dto/level-info.dto';
import { GratificationOptionDto } from './dto/gratification-option.dto';
import { LevelUpResultDto } from './dto/level-up-result.dto';

@ApiTags('Level System')
@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  /**
   * Obtiene información completa de nivel de un bruto específico
   */
  @Get('brute/:bruteId')
  @ApiOperation({ summary: 'Obtener información de nivel de un bruto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Información de nivel obtenida exitosamente', 
    type: LevelInfoDto 
  })
  async getBruteLevelInfo(@Param('bruteId', ParseIntPipe) bruteId: number): Promise<LevelInfoDto> {
    return this.levelService.getBruteLevelInfo(bruteId);
  }
  /**
   * Obtiene las gratificaciones disponibles para un bruto que puede subir de nivel
   */
  @Get('brute/:bruteId/gratifications')
  @ApiOperation({ summary: 'Obtener opciones de gratificación disponibles para un bruto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Opciones de gratificación obtenidas exitosamente', 
    type: [GratificationOptionDto] 
  })  async getAvailableGratifications(@Param('bruteId', ParseIntPipe) bruteId: number): Promise<GratificationOptionDto[]> {
    // Primero obtenemos la información del bruto para conocer su nivel
    const bruteInfo = await this.levelService.getBruteLevelInfo(bruteId);
    return this.levelService.getAvailableGratifications(bruteInfo.currentLevel + 1, bruteId);
  }

  /**
   * Ejecuta el level-up de un bruto con la gratificación elegida
   */
  @Post('level-up')
  @ApiOperation({ summary: 'Subir de nivel con gratificación elegida' })
  @ApiResponse({ 
    status: 200, 
    description: 'Level-up ejecutado exitosamente', 
    type: LevelUpResultDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error en la validación (XP insuficiente, gratificación inválida, etc.)' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Bruto no encontrado' 
  })  async levelUp(@Body() dto: LevelUpRequestDto): Promise<LevelUpResultDto> {
    return this.levelService.levelUpBrute(dto.bruteId, dto.gratificationChoice);
  }

  /**
   * ENDPOINT TEMPORAL PARA DIAGNÓSTICO - Verificar inconsistencias en gratificaciones
   */
  @Get('debug/gratifications-check')
  @ApiOperation({ summary: 'Verificar consistencia de gratificaciones en la base de datos' })
  async checkGratificationsConsistency() {
    return this.levelService.checkGratificationsConsistency();
  }
}
