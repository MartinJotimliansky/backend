import { ApiProperty } from '@nestjs/swagger';
import { BruteResponseDto } from '../../user/dto/brute-response.dto';
import { BattleLogDto } from './battle-log.dto';

export class BattleResultDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: () => BruteResponseDto })
    attacker: BruteResponseDto;

    @ApiProperty()
    defender: BruteResponseDto;

    @ApiProperty()
    winner: BruteResponseDto;

    @ApiProperty({ type: [BattleLogDto] })
    battleLogs: BattleLogDto[];
}
