import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
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

  async createBruteForUser(userId: string, name: string) {
    try {
      this.logger.debug(`Iniciando creación de bruto para usuario ${userId}`);
      
      const user = await this.getUserWithBrutes(userId);
      this.validateBruteLimit(user);
      
      const config = await this.getBrutoConfig();
      const totalPower = this.getRandomPower(config);
      
      this.logger.debug(`Configuración obtenida. Poder total: ${totalPower}`);
      
      const numStats = this.getRandomStatCount(config);
      const stats = this.generateStats(numStats);
      const hpRandom = this.getRandomHp(config);
      const hp = config.base_hp + hpRandom;
      const remainingPower = this.calculateRemainingPower(totalPower, numStats, hpRandom);
      
      this.logger.debug(`Stats generados. HP: ${hp}, Poder restante: ${remainingPower}`);

      const brute = await this.createBruteEntity(name, user);
      await this.createStatEntity(stats, hp, brute);

      await this.assignWeaponOrSkill(brute, config, remainingPower);
      
      this.logger.debug(`Bruto creado exitosamente con ID: ${brute.id}`);
      
      // Cargar las relaciones para devolver el objeto completo
      return await this.bruteRepository.findOne({
        where: { id: brute.id },
        relations: ['stats', 'bruteSkills', 'bruteSkills.skill', 'bruteWeapons', 'bruteWeapons.weapon']
      });

    } catch (error) {
      this.logger.error(`Error al crear bruto: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el bruto');
    }
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
      const bruteWeapon = new BruteWeapon();
      bruteWeapon.brute = brute;
      bruteWeapon.weapon = weapon;
      bruteWeapon.equipped = true;
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

  private async getUserWithBrutes(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['brutes'] });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    return user;
  }

  private validateBruteLimit(user: User) {
    const MAX_BRUTES = 100;
    if (user.brutes && user.brutes.length >= MAX_BRUTES) {
      throw new BadRequestException(`Máximo ${MAX_BRUTES} brutos por usuario`);
    }
  }

  private async getBrutoConfig(): Promise<BrutoConfig> {
    const config = await this.brutoConfigRepo.findOne({ where: {} });
    if (!config) throw new BadRequestException('No hay configuración de brutos');
    return config;
  }

  private getRandomPower(config: BrutoConfig) {
    return this.randomInt(config.min_total_power_points, config.max_total_power_points);
  }

  private getRandomStatCount(config: BrutoConfig) {
    const statNames = ['strenght', 'agility', 'endurance', 'intelligence'];
    const numStats = this.randomInt(config.min_stat_points, config.max_stat_points);
    if (numStats < statNames.length) throw new BadRequestException('min_stat_points debe ser >= 4');
    return numStats;
  }

  private generateStats(numStats: number) {
    const statNames = ['strenght', 'agility', 'endurance', 'intelligence'];
    return this.randomStatDistribution(numStats, statNames);
  }

  private getRandomHp(config: BrutoConfig) {
    return this.randomInt(config.min_health_points, config.max_health_points);
  }

  private calculateRemainingPower(totalPower: number, numStats: number, hp: number) {
    let usedPower = numStats + hp;
    return Math.max(0, totalPower - usedPower);
  }

  private async createBruteEntity(name: string, user: User) {
    const brute = this.bruteRepository.create({ name, user });
    await this.bruteRepository.save(brute);
    return brute;
  }

  private async createStatEntity(stats: any, hp: number, brute: Brute) {
    const stat = this.statRepo.create({ ...stats, hp, brute });
    await this.statRepo.save(stat);
    return stat;
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

  /**
   * Genera 10 brutos randoms para pruebas y los retorna como array.
   */
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

  async deleteBrute(brute: Brute) {
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

  async deleteAllBrutes() {
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

        // Obtener brutos del mismo nivel, excluyendo al bruto actual y los del mismo usuario
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

        // Asegurarse de que solo devolvemos 6 oponentes
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
}
