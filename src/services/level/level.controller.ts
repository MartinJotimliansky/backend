import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { LevelService } from './level.service';

export class LevelUpRequestDto {
  bruteId: number;
  gratificationChoice: {
    id: string; // Formato: "tipo_id" ej: "stat_boost_1", "weapon_2", "skill_3"
    type: 'stat_boost' | 'weapon' | 'skill';
  };
}

export class LevelStatusDto {
  bruteId: number;
  currentExperience: number;
  currentLevel: number;
}

@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  /**
   * Obtiene el estado de nivel detallado de un bruto
   */
  @Post('status')
  async getLevelStatus(@Body() dto: LevelStatusDto) {
    return this.levelService.getDetailedLevelInfo(
      dto.currentExperience, 
      dto.currentLevel
    );
  }  /**
   * Obtiene información de nivel de un bruto específico
   */
  @Get('brute/:bruteId')
  async getBruteLevelInfo(@Param('bruteId', ParseIntPipe) bruteId: number) {
    return this.levelService.getBruteLevelInfo(bruteId);
  }

  /**
   * Obtiene las 3 gratificaciones disponibles para elegir al subir de nivel
   */
  @Get('gratifications/:level')
  async getGratifications(@Param('level', ParseIntPipe) level: number) {
    return this.levelService.getAvailableGratifications(level);
  }

  /**
   * Aplica la gratificación elegida y sube de nivel
   */
  @Post('level-up')
  async levelUp(@Body() dto: LevelUpRequestDto) {
    return this.levelService.applyChosenGratification(
      dto.gratificationChoice,
      dto.bruteId
    );
  }

  /**
   * Sube de nivel automáticamente con una gratificación básica (para testing)
   */
  @Post('brute/:bruteId/level-up')
  async simpleLevelUp(@Param('bruteId', ParseIntPipe) bruteId: number) {
    return this.levelService.autoLevelUp(bruteId);
  }

  /**
   * Simula ganancia de experiencia
   */
  @Post('experience/simulate')
  async simulateExperience(@Body() body: { currentExperience: number; won: boolean }) {
    return this.levelService.updateExperience(
      body.currentExperience, 
      body.won
    );
  }

  /**
   * Valida que los datos de la base de datos coincidan con las fórmulas
   */
  @Get('validate')
  async validateLevelData() {
    const isValid = await this.levelService.validateLevelData();
    return { valid: isValid };
  }

  /**
   * Obtiene todos los niveles y experiencias (para debugging)
   */
  @Get('all')
  async getAllLevels() {
    return this.levelService.getAllLevelData();
  }
}
