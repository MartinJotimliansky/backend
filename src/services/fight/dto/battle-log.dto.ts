import { ApiProperty } from '@nestjs/swagger';

export class BattleLogDto {
    @ApiProperty({ example: 1 })
    turn: number;

    @ApiProperty({ example: 1 })
    playerTurn: number;

    @ApiProperty({ example: 'Ataque básico' })
    action: string;    @ApiProperty({ example: 10, required: false, nullable: true })
    damage?: number;

    @ApiProperty({ example: 0, required: false, nullable: true })
    healAmount?: number;

    @ApiProperty({ example: 90 })
    attackerHp: number;

    @ApiProperty({ example: 80 })
    defenderHp: number;
}
