import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
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
    const user = await this.getUserWithBrutes(userId);
    this.validateBruteLimit(user);
    const config = await this.getBrutoConfig();
    const totalPower = this.getRandomPower(config);
    const numStats = this.getRandomStatCount(config);
    const stats = this.generateStats(numStats);
    const hpRandom = this.getRandomHp(config);
    const hp = config.base_hp + hpRandom;
    const remainingPower = this.calculateRemainingPower(totalPower, numStats, hpRandom);

    const brute = await this.createBruteEntity(name, user);
    await this.createStatEntity(stats, hp, brute);

    try {
      await this.assignWeaponOrSkill(brute, config, remainingPower);
    } catch (error) {
      console.error('Error assigning weapon/skill:', error);
    }

    return brute;
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
    if (user.brutes && user.brutes.length >= 500) throw new BadRequestException('Máximo 50 brutos por usuario');
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
    // Busca el primer usuario existente
    const user = await this.userRepository.findOne({ where: {} });
    if (!user) throw new Error('No hay usuarios en la base de datos');
    const brutes: Brute[] = [];
    for (let i = 0; i < 10; i++) {
      const name = `TestBruto_${Date.now()}_${i}`;
      const brute = await this.createBruteForUser(user.id, name);
      brutes.push(brute);
    }
    return brutes;
  }
}
