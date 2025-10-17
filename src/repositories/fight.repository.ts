import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Battle } from '../entities/battle/battle.entity';
import { BattleLog } from '../entities/battle/battle_log.entity';

@Injectable()
export class FightRepository {
    constructor(
        @InjectRepository(Battle)
        private battleRepository: Repository<Battle>,
        @InjectRepository(BattleLog)
        private battleLogRepository: Repository<BattleLog>
    ) {}

    async createBattle(data: Partial<Battle>): Promise<Battle> {
        const battle = this.battleRepository.create(data);
        return this.battleRepository.save(battle);
    }

    async createBattleLog(data: { battle: Battle; logs: any[] }): Promise<void> {
        const log = this.battleLogRepository.create({
            battle: data.battle,
            logs: data.logs
        });
        await this.battleLogRepository.save(log);
    }

    async updateBattle(id: number, data: Partial<Battle>): Promise<void> {
        await this.battleRepository.update(id, data);
    }

    async findBattleById(id: number): Promise<Battle | null> {
        return this.battleRepository.findOne({
            where: { id },
            relations: [
                'bruteAttacker',
                'bruteDefender',
                'winnerBrute',
                'logs'
            ]
        });
    }    async findBattlesByBruteId(bruteId: number): Promise<Battle[]> {
        return this.battleRepository.find({
            where: [
                { bruteAttackerId: bruteId },
                { bruteDefenderId: bruteId }
            ],
            relations: [
                'bruteAttacker',
                'bruteDefender',
                'winnerBrute',
                'logs'
            ],
            order: {
                id: 'DESC'
            }
        });
    }

    async findBattleHistoryByBruteId(bruteId: number): Promise<Battle[]> {
        return this.battleRepository.find({
            where: [
                { bruteAttackerId: bruteId },
                { bruteDefenderId: bruteId }
            ],
            relations: [
                'bruteAttacker',
                'bruteAttacker.stats',
                'bruteDefender',
                'bruteDefender.stats',
                'winnerBrute',
                'winnerBrute.stats'
                // Intencionalmente NO incluimos 'logs' para optimizar rendimiento
            ],
            order: {
                id: 'DESC'
            }
        });
    }
}
