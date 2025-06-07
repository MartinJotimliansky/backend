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
    ) {}    async createBruteForUser(userId: string, name: string): Promise<Brute | null> {
        try {
            this.logger.debug(`Creating brute for user ${userId}`);
            
            const user = await this.getUserWithBrutes(userId);
            const config = await this.getBrutoConfig();
            
            // Validar límite usando la configuración de la base de datos
            await this.validateBruteLimitWithConfig(user, config);
            
            const totalPower = this.getRandomPower(config);
            
            this.logger.debug(`Config obtained. Total power: ${totalPower}`);
            
            const numStats = this.getRandomStatCount(config);
            const stats = this.generateStats(numStats);
            const hpRandom = this.getRandomHp(config);
            const hp = config.base_hp + hpRandom;
            const remainingPower = this.calculateRemainingPower(totalPower, numStats, hpRandom);
            
            this.logger.debug(`Stats generated. HP: ${hp}, Remaining power: ${remainingPower}`);

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

    async getUserFromDb(userId: string) {
        return this.userRepository.findOne({ where: { id: userId } });
    }    private validateBruteLimit(user: User) {
        // Este método ahora será async y se llamará después de obtener la config
        // Se mantendrá por compatibilidad pero ya no se usa el MAX_BRUTES hardcoded
    }

    private async validateBruteLimitWithConfig(user: User, config: BrutoConfig) {
        if (user.brutes && user.brutes.length >= config.max_brutes) {
            throw new BadRequestException(`Máximo ${config.max_brutes} brutos por usuario`);
        }
    }    private async getBrutoConfig(): Promise<BrutoConfig> {
        const config = await this.brutoConfigRepo.findOne({ where: {} });
        if (!config) throw new BadRequestException('No hay configuración de brutos');
        return config;
    }

    async getBruteConfig(): Promise<BrutoConfig> {
        return this.getBrutoConfig();
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

    private calculateRemainingPower(totalPower: number, numStats: number, hp: number) {
        return totalPower - numStats - hp;
    }

    private async createBruteEntity(name: string, user: User): Promise<Brute> {
        const brute = this.bruteRepository.create({
            name,
            user,
            level: 1,
            xp: 0,
            gold: 0
            // avatar eliminado porque ya no existe en la entidad
        });
        return await this.bruteRepository.save(brute);
    }

    private async createStatEntity(stats: any, hp: number, brute: Brute) {
        const stat = this.statRepo.create({ ...stats, hp, brute });
        await this.statRepo.save(stat);
        return stat;
    }

    private async assignWeaponOrSkill(brute: Brute, config: BrutoConfig, remainingPower: number) {
        if (remainingPower <= 0) return;

        const choice = Math.random();
        if (choice < 0.5) {
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
            const bruteWeapon = this.bruteWeaponRepo.create({ brute, weapon });
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
            const bruteSkill = new BruteSkill();
            bruteSkill.brute = brute;
            bruteSkill.skill = skill;
            
            if (skill.activationTriggers && skill.activationTriggers.length > 0) {
                bruteSkill.selectedTrigger = skill.activationTriggers[
                    Math.floor(Math.random() * skill.activationTriggers.length)
                ];
            } else {
                bruteSkill.selectedTrigger = null;
            }

            await this.bruteSkillRepo.save(bruteSkill);
        }
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

    private randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async getRandomOpponents(bruteId: number, count: number): Promise<Brute[]> {
        try {
            this.logger.debug(`[getRandomOpponents] Starting search for opponents. BruteId: ${bruteId}, Count: ${count}`);
              const brute = await this.getBruteById(bruteId);
            if (!brute) {
                this.logger.error(`[getRandomOpponents] Brute not found with id: ${bruteId}`);
                throw new BadRequestException('Bruto no encontrado');
            }

            this.logger.debug(`[getRandomOpponents] Found brute: ${brute.id}, Level: ${brute.level}, UserId: ${brute.user.id}`);

            // Get brutes of same level
            const sameLevel = await this.bruteRepository
                .createQueryBuilder('brute')
                .select('brute.id')
                .addSelect('RANDOM()', 'rand')
                .where('brute.level = :level', { level: brute.level })
                .andWhere('brute.id != :bruteId', { bruteId })
                .andWhere('brute.user != :userId', { userId: brute.user.id })
                .orderBy('rand')
                .limit(count)
                .getMany();

            const sameLevelIds = sameLevel.map(b => b.id);
            
            // If we don't have enough of same level, get some from adjacent levels
            let remainingCount = count - sameLevelIds.length;
            let additionalBrutes: Brute[] = [];
              if (remainingCount > 0) {
                const queryBuilder = this.bruteRepository
                    .createQueryBuilder('brute')
                    .select('brute.id')
                    .addSelect('RANDOM()', 'rand')
                    .where('brute.level BETWEEN :minLevel AND :maxLevel', { 
                        minLevel: Math.max(1, brute.level - 1),
                        maxLevel: brute.level + 1
                    })
                    .andWhere('brute.id != :bruteId', { bruteId })
                    .andWhere('brute.user != :userId', { userId: brute.user.id });

                // Only add NOT IN filter if sameLevelIds has elements
                if (sameLevelIds.length > 0) {
                    queryBuilder.andWhere('brute.id NOT IN (:...ids)', { ids: sameLevelIds });
                }

                additionalBrutes = await queryBuilder
                    .orderBy('rand')
                    .limit(remainingCount)
                    .getMany();
            }

            const allOpponentIds = [...sameLevelIds, ...additionalBrutes.map(b => b.id)];

            // Get full brute data with relations
            const opponents = await this.bruteRepository.find({
                where: { id: In(allOpponentIds) },
                relations: [
                    'stats',
                    'bruteSkills',
                    'bruteSkills.skill',
                    'bruteWeapons',
                    'bruteWeapons.weapon',
                    'user'
                ]
            });

            return opponents;
        } catch (error) {
            this.logger.error(`[getRandomOpponents] Error: ${error.message}`, error.stack);
            throw error;
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
        const config = await this.getBrutoConfig();
        const brutes: Brute[] = [];

        for (let i = 0; i < 10; i++) {
            const brute = this.bruteRepository.create({
                name: `Test Brute ${i + 1}`,
                level: Math.floor(Math.random() * 5) + 1
            });
            await this.bruteRepository.save(brute);

            const totalPower = this.getRandomPower(config);
            const numStats = this.getRandomStatCount(config);
            const stats = this.generateStats(numStats);
            const hpRandom = this.getRandomHp(config);
            const hp = config.base_hp + hpRandom;
            
            await this.createStatEntity(stats, hp, brute);
            await this.assignWeaponOrSkill(brute, config, totalPower - numStats - hpRandom);

            brutes.push(brute);
        }

        return brutes;
    }

    async selectBrute(userId: string, bruteId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('Usuario no encontrado');

        const brute = await this.bruteRepository.findOne({ 
            where: { id: bruteId, user: { id: userId } },
            relations: ['user']
        });
        
        if (!brute) throw new BadRequestException('El bruto no pertenece al usuario');
        
        user.selected_brute_id = bruteId;
        await this.userRepository.save(user);
        return { message: 'Bruto seleccionado', selected_brute_id: bruteId };
    }

    async getAllBrutes(): Promise<Brute[]> {
        return this.bruteRepository.find({
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

    async getAllWeapons(): Promise<Weapon[]> {
        return this.weaponRepo.find({
            order: { name: 'ASC' }
        });
    }

    async getAllSkills(): Promise<Skill[]> {
        return this.skillRepo.find({
            order: { name: 'ASC' }
        });
    }
}
