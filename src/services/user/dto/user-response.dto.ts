import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 0 })
  premium_currency: number;

  @ApiProperty({ example: 1, nullable: true })
  selected_brute_id: number | null;

  @ApiProperty({
    example: {
      id: 1,
      name: 'MiBruto',
      level: 1,
      xp: 0,
      gold: 0,
      stats: {
        hp: 100,
        strenght: 10,
        agility: 10,
        endurance: 10,
        intelligence: 10,
      },
    },
    nullable: true,
    description: 'Bruto actualmente seleccionado por el usuario.',
  })
  selectedBrute: any | null;
}
