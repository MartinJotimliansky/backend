import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Brute } from '../entities/brute/brute.entity';
import { User } from '../entities/user.entity';
import { Stat } from '../entities/brute/stat.entity';
import { BrutoConfig } from '../entities/brute/bruto_config.entity';

@Injectable()
export class BruteRepository {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Brute)
        private bruteRepository: Repository<Brute>,
        @InjectRepository(Stat)
        private statRepository: Repository<Stat>,
        @InjectRepository(BrutoConfig)
        private brutoConfigRepository: Repository<BrutoConfig>
    ) {}

    async findById(id: number): Promise<Brute | null> {
        return this.bruteRepository.findOne({
            where: { id },
            relations: [
                'stats',
                'user'
            ]
        });
    }

    async findByIdWithUser(id: number): Promise<Brute | null> {
        return this.bruteRepository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async findRandomOpponentsByLevel(level: number, excludeBruteId: number, excludeUserId: string, count: number): Promise<Brute[]> {
        const sameLevel = await this.bruteRepository
            .createQueryBuilder('brute')
            .select('brute.id')
            .addSelect('RANDOM()', 'rand')
            .leftJoin('brute.user', 'user')
            .where('brute.level = :level', { level })
            .andWhere('brute.id != :excludeBruteId', { excludeBruteId })
            .andWhere('user.id != :excludeUserId', { excludeUserId })
            .orderBy('rand')
            .take(count)
            .getRawMany();

        return this.findByIds(sameLevel.map(b => b.brute_id));
    }

    async findRandomOpponentsByLevelRange(
        minLevel: number,
        maxLevel: number,
        excludeIds: number[],
        excludeUserId: string,
        count: number
    ): Promise<Brute[]> {
        const queryBuilder = this.bruteRepository
            .createQueryBuilder('brute')
            .select('brute.id')
            .addSelect('RANDOM()', 'rand')
            .leftJoin('brute.user', 'user')
            .where('brute.level BETWEEN :minLevel AND :maxLevel', { minLevel, maxLevel })
            .andWhere('user.id != :excludeUserId', { excludeUserId });

        // Only add NOT IN filter if excludeIds has elements
        if (excludeIds.length > 0) {
            queryBuilder.andWhere('brute.id NOT IN (:...excludeIds)', { excludeIds });
        }

        const nearLevel = await queryBuilder
            .orderBy('rand')
            .take(count)
            .getRawMany();

        return this.findByIds(nearLevel.map(b => b.brute_id));
    }

    private async findByIds(ids: number[]): Promise<Brute[]> {
        return this.bruteRepository.find({
            where: { id: In(ids) },
            relations: [
                'stats',
                'user'
            ]
        });
    }

    async create(brute: Partial<Brute>): Promise<Brute> {
        const newBrute = this.bruteRepository.create(brute);
        return this.bruteRepository.save(newBrute);
    }

    async createStat(stat: Partial<Stat>): Promise<Stat> {
        const newStat = this.statRepository.create(stat);
        return this.statRepository.save(newStat);
    }

    async getBrutoConfig(): Promise<BrutoConfig | null> {
        return this.brutoConfigRepository.findOne({ where: {} });
    }

    async delete(brute: Brute): Promise<void> {
        await this.bruteRepository.remove(brute);
    }

    async deleteAll(): Promise<void> {
        await this.bruteRepository.manager.transaction(async manager => {
            await manager.query('DELETE FROM brute_level_choices');
            await manager.query('DELETE FROM brute_cosmetics');
            await manager.query('DELETE FROM purchases');
            await manager.query('DELETE FROM stats');
            await manager.query('DELETE FROM brutes');
        });
    }

    async findUserWithSelectedBrute(userId: string) {
        return this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'selected_brute_id']
        });
    }
}
