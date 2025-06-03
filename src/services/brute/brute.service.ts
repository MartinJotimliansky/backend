import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Brute } from '../../entities/brute/brute.entity';
import { User } from '../../entities/user.entity';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Weapon } from '../../entities/items/weapon.entity';
import { Skill } from '../../entities/items/skill.entity';
import { BruteWeapon } from '../../entities/brute/brute_weapon.entity';
import { BruteSkill } from '../../entities/brute/brute_skill.entity';

@Injectable()
export class BruteService {
    private readonly logger = new Logger(BruteService.name);

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Brute) private bruteRepository: Repository<Brute>,
        @InjectRepository(BrutoConfig) private brutoConfigRepo: Repository<BrutoConfig>,
        @InjectRepository(Stat) private statRepo: Repository<Stat>,
        @InjectRepository(Weapon) private weaponRepo: Repository<Weapon>,
        @InjectRepository(Skill) private skillRepo: Repository<Skill>,
        @InjectRepository(BruteWeapon) private bruteWeaponRepo: Repository<BruteWeapon>,
        @InjectRepository(BruteSkill) private bruteSkillRepo: Repository<BruteSkill>,
    ) {}

    async createBruteForUser(userId: string, name: string): Promise<Brute | null> {
        try {
            this.logger.debug(`Creating brute for user ${userId}`);
            
            const user = await this.getUserWithBrutes(userId);
            
            const config = await this.getBrutoConfig();
            const totalPower = this.getRandomPower(config);
            const numStats = this.getRandomStatCount(config);
            const stats = this.generateStats(numStats);
            const hpRandom = this.getRandomHp(config);
            const hp = config.base_hp + hpRandom;
            const remainingPower = totalPower - numStats - hpRandom;

            const brute = await this.createBruteEntity(name, user);
            await this.createStatEntity(stats, hp, brute);
            await this.assignWeaponOrSkill(brute, config, remainingPower);

            return this.getBruteById(brute.id);
        } catch (error) {
            this.logger.error(`Error creating brute: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error creating brute');
        }
    }

    private async getUserWithBrutes(userId: string) {
        const user = await this.userRepository.findOne({ 
            where: { id: userId },
            relations: ['brutes']
        });
        if (!user) throw new BadRequestException('Usuario no encontrado');
        return user;
    }

    private async getBrutoConfig(): Promise<BrutoConfig> {
        const config = await this.brutoConfigRepo.findOne({ where: {} });
        if (!config) throw new BadRequestException('No hay configuración de brutos');
        return config;
    }

    private getRandomPower(config: BrutoConfig): number {
        return this.randomInt(config.min_total_power_points, config.max_total_power_points);
    }

    private getRandomStatCount(config: BrutoConfig): number {
        return this.randomInt(config.min_stat_points, config.max_stat_points);
    }

    private getRandomHp(config: BrutoConfig): number {
        return this.randomInt(config.min_health_points, config.max_health_points);
    }

    private generateStats(numStats: number) {
        const statNames = ['strenght', 'agility', 'endurance', 'intelligence'];
        return this.randomStatDistribution(numStats, statNames);
    }

    private async createBruteEntity(name: string, user: User): Promise<Brute> {
        const brute = this.bruteRepository.create({ name, user });
        await this.bruteRepository.save(brute);
        return brute;
    }

    private async createStatEntity(stats: any, hp: number, brute: Brute) {
        const stat = this.statRepo.create({ ...stats, hp, brute });
        await this.statRepo.save(stat);
        return stat;
    }

    private async assignWeaponOrSkill(brute: Brute, config: BrutoConfig, remainingPower: number) {
        const roll = Math.random() * 100;
        if (roll < config.weapon_chance) {
            await this.assignWeapon(brute, remainingPower);
        } else {
            await this.assignSkill(brute, remainingPower);
        }
    }

    private async assignWeapon(brute: Brute, remainingPower: number) {
        const weapons = await this.weaponRepo.find({
            where: { power_value: LessThanOrEqual(remainingPower) },
            order: { power_value: 'DESC' }
        });

        if (weapons.length > 0) {
            const weapon = weapons[Math.floor(Math.random() * weapons.length)];
            const bruteWeapon = this.bruteWeaponRepo.create({
                brute,
                weapon,
                equipped: true
            });
            await this.bruteWeaponRepo.save(bruteWeapon);
        }
    }

    private async assignSkill(brute: Brute, remainingPower: number) {
        const skills = await this.skillRepo.find({
            where: { power_value: LessThanOrEqual(remainingPower) },
            order: { power_value: 'DESC' }
        });

        if (skills.length > 0) {
            const skill = skills[Math.floor(Math.random() * skills.length)];
            const bruteSkill = this.bruteSkillRepo.create({
                brute,
                skill,
                selectedTrigger: skill.activationTriggers?.[0] ?? null
            });
            await this.bruteSkillRepo.save(bruteSkill);
        }
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private randomStatDistribution(total: number, statNames: string[]) {
        const stats: any = {};
        statNames.forEach(stat => stats[stat] = 1);
        let remaining = total - statNames.length;
        while (remaining > 0) {
            const idx = Math.floor(Math.random() * statNames.length);
            stats[statNames[idx]]++;
            remaining--;
        }
        return stats;
    }

    async getRandomOpponents(bruteId: number, count: number): Promise<Brute[]> {
        try {
            this.logger.debug(`[getRandomOpponents] Starting search for opponents. BruteId: ${bruteId}, Count: ${count}`);
            
            const brute = await this.bruteRepository.findOne({
                where: { id: bruteId },
                relations: ['user']
            });

            if (!brute) {
                this.logger.error(`[getRandomOpponents] Brute not found with id: ${bruteId}`);
                throw new BadRequestException('Bruto no encontrado');
            }

            this.logger.debug(`[getRandomOpponents] Found brute: ${brute.id}, Level: ${brute.level}, UserId: ${brute.user.id}`);

            // Obtener brutos del mismo nivel
            const sameLevel = await this.bruteRepository
                .createQueryBuilder('brute')
                .select('brute.id')
                .addSelect('RANDOM()', 'rand')
                .leftJoin('brute.user', 'user')
                .where('brute.level = :level', { level: brute.level })
                .andWhere('brute.id != :bruteId', { bruteId })
                .andWhere('user.id != :userId', { userId: brute.user.id })
                .orderBy('rand')
                .take(count)
                .getRawMany();

            this.logger.debug('[getRandomOpponents] Executing same level query...');
            
            const sameLevelBrutes = await this.bruteRepository.find({
                where: { id: In(sameLevel.map(b => b.brute_id)) },
                relations: [
                    'stats',
                    'bruteSkills',
                    'bruteSkills.skill',
                    'bruteWeapons',
                    'bruteWeapons.weapon',
                    'user'
                ]
            });
            
            this.logger.debug(`[getRandomOpponents] Found ${sameLevelBrutes.length} opponents of same level`);

            if (sameLevelBrutes.length < count) {
                this.logger.debug(`[getRandomOpponents] Not enough same-level opponents, searching nearby levels...`);
                const remainingCount = count - sameLevelBrutes.length;
                const existingIds = [...sameLevelBrutes.map(b => b.id), bruteId];

                const nearLevelIds = await this.bruteRepository
                    .createQueryBuilder('brute')
                    .select('brute.id')
                    .addSelect('RANDOM()', 'rand')
                    .leftJoin('brute.user', 'user')
                    .where('brute.level BETWEEN :minLevel AND :maxLevel', { 
                        minLevel: Math.max(1, brute.level - 1), 
                        maxLevel: brute.level + 1 
                    })
                    .andWhere('brute.id NOT IN (:...existingIds)', { existingIds })
                    .andWhere('user.id != :userId', { userId: brute.user.id })
                    .orderBy('rand')
                    .take(remainingCount)
                    .getRawMany();

                this.logger.debug('[getRandomOpponents] Executing nearby levels query...');

                if (nearLevelIds.length > 0) {
                    const nearLevelBrutes = await this.bruteRepository.find({
                        where: { id: In(nearLevelIds.map(b => b.brute_id)) },
                        relations: [
                            'stats',
                            'bruteSkills',
                            'bruteSkills.skill',
                            'bruteWeapons',
                            'bruteWeapons.weapon',
                            'user'
                        ]
                    });
                    this.logger.debug(`[getRandomOpponents] Found ${nearLevelBrutes.length} additional opponents from nearby levels`);
                    sameLevelBrutes.push(...nearLevelBrutes);
                }
            }

            const finalOpponents = sameLevelBrutes.slice(0, 6);
            this.logger.debug(`[getRandomOpponents] Successfully found total ${finalOpponents.length} opponents`);
            return finalOpponents;

        } catch (error) {
            this.logger.error('[getRandomOpponents] Error occurred:', {
                message: error.message,
                stack: error.stack,
                bruteId,
                count,
                error: error
            });
            
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            throw new Error(`Error al buscar oponentes: ${error.message}`);
        }
    }

    async getBruteById(bruteId: number): Promise<Brute | null> {
        return this.bruteRepository.findOne({
            where: { id: bruteId },
            relations: [
                'stats',
                'bruteSkills',
                'bruteSkills.skill',
                'bruteWeapons',
                'bruteWeapons.weapon',
                'user'
            ]
        });
    }

    async deleteBrute(brute: Brute): Promise<void> {
        await this.bruteRepository.manager.transaction(async manager => {
            await manager.delete('brute_level_choices', { brute: brute.id });
            await manager.delete('brute_skills', { brute: brute.id });
            await manager.delete('brute_weapons', { brute: brute.id });
            await manager.delete('brute_cosmetics', { brute: brute.id });
            await manager.delete('purchases', { brute: brute.id });
            await manager.delete('stats', { brute: brute.id });
            await manager.delete('brutes', { id: brute.id });
        });
    }

    async deleteAllBrutes(): Promise<void> {
        await this.bruteRepository.manager.transaction(async manager => {
            await manager.query('DELETE FROM brute_level_choices');
            await manager.query('DELETE FROM brute_skills');
            await manager.query('DELETE FROM brute_weapons');
            await manager.query('DELETE FROM brute_cosmetics');
            await manager.query('DELETE FROM purchases');
            await manager.query('DELETE FROM stats');
            await manager.query('DELETE FROM brutes');
        });
    }

    async generateRandomBrutesForTesting(): Promise<Brute[]> {
        const user = await this.userRepository.findOne({ where: {} });
        if (!user) throw new Error('No hay usuarios en la base de datos');
        
        const brutes: Brute[] = [];
        for (let i = 0; i < 10; i++) {
            const name = `TestBruto_${Date.now()}_${i}`;
            const brute = await this.createBruteForUser(user.id, name);
            if (brute) {
                brutes.push(brute);
            }
        }
        return brutes;
    }

    // ... rest of your existing methods
}
