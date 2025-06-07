import { ApiProperty } from '@nestjs/swagger';

export class LevelInfoDto {
  @ApiProperty({ description: 'ID del bruto' })
  bruteId: number;

  @ApiProperty({ description: 'Nombre del bruto' })
  bruteName: string;

  @ApiProperty({ description: 'Nivel actual del bruto' })
  currentLevel: number;
  
  @ApiProperty({ description: 'Experiencia actual del bruto' })
  currentXp: number;

  @ApiProperty({ description: 'Experiencia total requerida para el siguiente nivel (nivel actual + 5)' })
  nextLevelXp: number;

  @ApiProperty({ description: 'Porcentaje de progreso hacia el siguiente nivel' })
  progressPercentage: number;

  @ApiProperty({ description: 'Si el bruto puede subir de nivel' })
  canLevelUp: boolean;

  @ApiProperty({ description: 'Si el bruto está bloqueado para combatir' })
  blockedFromCombat: boolean;

  @ApiProperty({ description: 'Si el bruto ha alcanzado el nivel máximo' })
  isMaxLevel: boolean;
}
