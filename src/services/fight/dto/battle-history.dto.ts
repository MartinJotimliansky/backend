import { ApiProperty } from '@nestjs/swagger';
import { BruteResponseDto } from '../../user/dto/brute-response.dto';

export class BattleHistoryDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: () => BruteResponseDto })
    attacker: BruteResponseDto;

    @ApiProperty({ type: () => BruteResponseDto })
    defender: BruteResponseDto;

    @ApiProperty({ type: () => BruteResponseDto })
    winner: BruteResponseDto;
    // No incluimos battleLogs para optimizar rendimiento en el historial
}
