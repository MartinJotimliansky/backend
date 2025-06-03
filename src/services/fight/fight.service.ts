import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Battle } from '../../entities/battle/battle.entity';
import { BattleLog } from '../../entities/battle/battle_log.entity';
import { Brute } from '../../entities/brute/brute.entity';

@Injectable()
export class FightService {
    private readonly logger = new Logger(FightService.name);

    constructor(
        @InjectRepository(Battle)
        private battleRepository: Repository<Battle>,
        @InjectRepository(BattleLog)
        private battleLogRepository: Repository<BattleLog>,
        @InjectRepository(Brute)
        private bruteRepository: Repository<Brute>,
    ) {}

    // Aquí irá la lógica de combate
}
