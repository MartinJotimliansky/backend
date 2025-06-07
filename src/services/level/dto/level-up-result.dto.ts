import { ApiProperty } from '@nestjs/swagger';

export class LevelUpResultDto {
  @ApiProperty({ description: 'Si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Nuevo nivel del bruto' })
  newLevel: number;

  @ApiProperty({ description: 'Tipo de gratificación aplicada' })
  gratificationType: string;

  @ApiProperty({ description: 'Descripción de lo que se aplicó' })
  description: string;

  @ApiProperty({ description: 'Estadísticas aplicadas (si es stat boost)' })
  appliedStats?: {
    hp: number;
    strength: number;
    resistance: number;
    speed: number;
    intelligence: number;
  };

  @ApiProperty({ description: 'Arma aplicada (si es weapon)' })
  appliedWeapon?: {
    id: number;
    name: string;
    stats: any;
  };

  @ApiProperty({ description: 'Habilidad aplicada (si es skill)' })
  appliedSkill?: {
    id: number;
    name: string;
    effects: any;
  };

  @ApiProperty({ description: 'Mensaje de resultado' })
  message: string;
}
