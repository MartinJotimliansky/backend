import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Gratification } from '../../entities/battle/gratification.entity';
import { StatBoostPossibility } from '../../entities/battle/stat_boost_possibility.entity';
import { BruteLevelChoice } from '../../entities/brute/brute_level_choice.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Brute } from '../../entities/brute/brute.entity';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { BruteService } from '../brute/brute.service';
import { LevelInfoDto } from './dto/level-info.dto';
import { GratificationOptionDto } from './dto/gratification-option.dto';
import { LevelUpResultDto } from './dto/level-up-result.dto';
import { GratificationChoiceDto } from './dto/level-up-request.dto';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Gratification)
    private gratificationRepository: Repository<Gratification>,
    @InjectRepository(StatBoostPossibility)
    private statBoostPossibilityRepository: Repository<StatBoostPossibility>,
    @InjectRepository(BruteLevelChoice)
    private bruteLevelChoiceRepository: Repository<BruteLevelChoice>,
    @InjectRepository(Stat)
    private statRepository: Repository<Stat>,
    @InjectRepository(Brute)
    private bruteRepository: Repository<Brute>,
    @InjectRepository(BrutoConfig)
    private brutoConfigRepository: Repository<BrutoConfig>,
    private bruteService: BruteService,
  ) {}

  // ================================
  // CORE LEVEL CALCULATION METHODS
  // ================================
  
  /**
   * Obtiene el nivel máximo desde la configuración del backoffice
   * @returns nivel máximo permitido
   */
  private async getMaxLevel(): Promise<number> {
    const config = await this.brutoConfigRepository.findOne({ where: {} });
    return config?.max_lvl || 50; // Default a 50 si no hay configuración
  }  /**
   * Calcula la experiencia requerida para subir al siguiente nivel
   * Fórmula: nivel actual + 5
   * @param currentLevel - nivel actual del bruto
   * @returns experiencia requerida para subir al siguiente nivel
   */
  private getExperienceRequiredForNextLevel(currentLevel: number): number {
    return currentLevel + 5;
  }  async getBruteLevelInfo(bruteId: number): Promise<LevelInfoDto> {
    const brute = await this.bruteService.getBruteById(bruteId);
    
    if (!brute) {
      throw new NotFoundException('Bruto no encontrado');
    }

    const currentLevel = brute.level;
    const currentExperience = brute.xp;
    const maxLevel = await this.getMaxLevel();
    
    // Si ya está en nivel máximo
    if (currentLevel >= maxLevel) {
      return {
        bruteId: brute.id,
        bruteName: brute.name,
        currentLevel,
        currentXp: currentExperience,
        nextLevelXp: 0,
        progressPercentage: 100,
        canLevelUp: false,
        blockedFromCombat: false,
        isMaxLevel: true
      };
    }

    // Experiencia requerida para el siguiente nivel: nivel actual + 5
    const nextLevelExpRequired = this.getExperienceRequiredForNextLevel(currentLevel);
    
    // Progreso hacia el siguiente nivel
    const progressPercentage = nextLevelExpRequired > 0 ? 
      Math.floor((currentExperience / nextLevelExpRequired) * 100) : 0;
    
    // Verificar si puede subir de nivel
    const canLevelUp = currentExperience >= nextLevelExpRequired;

    return {
      bruteId: brute.id,
      bruteName: brute.name,
      currentLevel,
      currentXp: currentExperience,
      nextLevelXp: nextLevelExpRequired,
      progressPercentage,
      canLevelUp,
      blockedFromCombat: canLevelUp,
      isMaxLevel: false
    };
  }

  // ================================
  // GRATIFICATION METHODS
  // ================================

  /**
   * Obtiene las gratificaciones disponibles para un nivel específico
   * Filtra armas y habilidades que el bruto ya posee
   * @param level - nivel del jugador
   * @param bruteId - ID del bruto para filtrar items ya poseídos
   * @returns array de 3 gratificaciones para elegir
   */
  async getAvailableGratifications(level: number, bruteId: number): Promise<GratificationOptionDto[]> {
    const brute = await this.bruteService.getBruteById(bruteId);
    if (!brute) {
      throw new NotFoundException('Bruto no encontrado');
    }

    // Obtener IDs de armas y habilidades que ya tiene el bruto
    const ownedWeaponIds = brute.bruteWeapons?.map(bw => bw.weapon.id) || [];
    const ownedSkillIds = brute.bruteSkills?.map(bs => bs.skill.id) || [];

    const options: GratificationOptionDto[] = [];

    // Agregar stat boost (siempre disponible)
    const statBoost = await this.getRandomStatBoost(level);
    if (statBoost) {
      options.push(statBoost);
    }

    // Agregar arma disponible (que no tenga el bruto)
    const weapon = await this.getRandomWeapon(level, ownedWeaponIds);
    if (weapon) {
      options.push(weapon);
    }

    // Agregar habilidad disponible (que no tenga el bruto)
    const skill = await this.getRandomSkill(level, ownedSkillIds);
    if (skill) {
      options.push(skill);
    }

    // Si no tenemos 3 opciones, completar con más stat boosts
    while (options.length < 3) {
      const additionalStatBoost = await this.getRandomStatBoost(level, 
        options.filter(o => o.type === 'stat_boost').map(o => parseInt(o.id.split('_')[2]))
      );
      if (additionalStatBoost) {
        options.push(additionalStatBoost);
      } else {
        break;
      }
    }

    return options.slice(0, 3);
  }

  /**
   * Obtiene un stat boost aleatorio disponible para el nivel
   */
  private async getRandomStatBoost(level: number, excludeIds: number[] = []): Promise<GratificationOptionDto | null> {
    let query = this.statBoostPossibilityRepository
      .createQueryBuilder('sbp')
      .where('sbp.min_level <= :level', { level });
    
    if (excludeIds.length > 0) {
      query = query.andWhere('sbp.id NOT IN (:...excludeIds)', { excludeIds });
    }
    
    const statBoosts = await query
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    if (statBoosts.length === 0) return null;

    const sb = statBoosts[0];
    return {
      id: `stat_boost_${sb.id}`,
      type: 'stat_boost',
      name: this.getStatBoostName(sb),
      description: this.getStatBoostDescription(sb),
      data: sb
    };
  }

  /**
   * Obtiene un arma aleatoria disponible para el nivel
   */
  private async getRandomWeapon(level: number, ownedWeaponIds: number[] = []): Promise<GratificationOptionDto | null> {
    let query = this.gratificationRepository
      .createQueryBuilder('g')
      .where('g.min_level <= :level', { level })
      .andWhere('g.type = :type', { type: 'weapon' });
    
    if (ownedWeaponIds.length > 0) {
      query = query.andWhere('g.id NOT IN (:...ownedIds)', { ownedIds: ownedWeaponIds });
    }
    
    const weapons = await query
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    if (weapons.length === 0) return null;

    const weapon = weapons[0];
    return {
      id: `weapon_${weapon.id}`,
      type: 'weapon',
      name: weapon.name,
      description: `Nueva arma: ${weapon.name}`,
      data: weapon
    };
  }

  /**
   * Obtiene una habilidad aleatoria disponible para el nivel
   */
  private async getRandomSkill(level: number, ownedSkillIds: number[] = []): Promise<GratificationOptionDto | null> {
    let query = this.gratificationRepository
      .createQueryBuilder('g')
      .where('g.min_level <= :level', { level })
      .andWhere('g.type = :type', { type: 'skill' });
    
    if (ownedSkillIds.length > 0) {
      query = query.andWhere('g.id NOT IN (:...ownedIds)', { ownedIds: ownedSkillIds });
    }
    
    const skills = await query
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    if (skills.length === 0) return null;

    const skill = skills[0];
    return {
      id: `skill_${skill.id}`,
      type: 'skill',
      name: skill.name,
      description: `Nueva habilidad: ${skill.name}`,
      data: skill
    };
  }

  // ================================
  // LEVEL UP METHODS
  // ================================
  /**
   * Procesa el level up de un bruto con la gratificación elegida
   * @param bruteId - ID del bruto
   * @param gratificationChoice - gratificación elegida por el jugador
   * @returns resultado del level up
   */  async levelUpBrute(bruteId: number, gratificationChoice: GratificationChoiceDto): Promise<LevelUpResultDto> {
    const brute = await this.bruteService.getBruteById(bruteId);
    if (!brute) {
      throw new NotFoundException('Bruto no encontrado');
    }

    const maxLevel = await this.getMaxLevel();    // Verificar que puede subir de nivel usando la fórmula: nivel actual + 5
    const nextLevelExp = this.getExperienceRequiredForNextLevel(brute.level);
    const canLevelUp = brute.level < maxLevel && brute.xp >= nextLevelExp;
    
    if (!canLevelUp) {
      throw new BadRequestException('El bruto no tiene suficiente experiencia para subir de nivel');
    }

    // Verificar que el bruto no haya alcanzado el nivel máximo
    if (brute.level >= maxLevel) {
      throw new BadRequestException('El bruto ya ha alcanzado el nivel máximo');
    }    const newLevel = brute.level + 1;
    
    // Calcular experiencia requerida para este level up
    const expRequiredForLevelUp = this.getExperienceRequiredForNextLevel(brute.level);
    
    // Calcular experiencia restante después de subir de nivel
    const remainingExp = brute.xp - expRequiredForLevelUp;

    // Aplicar la gratificación elegida
    const result = await this.applyGratification(bruteId, gratificationChoice, newLevel);

    // Actualizar nivel y experiencia del bruto
    brute.level = newLevel;
    brute.xp = remainingExp; // La experiencia se "consume" al subir de nivel
    await this.bruteRepository.save(brute);

    // Registrar la elección
    await this.recordLevelChoice(bruteId, newLevel, gratificationChoice);

    return {
      success: true,
      newLevel: brute.level,
      gratificationType: gratificationChoice.type,
      description: result.description,
      appliedStats: 'appliedStats' in result ? result.appliedStats : undefined,
      appliedWeapon: 'appliedWeapon' in result ? result.appliedWeapon : undefined,
      appliedSkill: 'appliedSkill' in result ? result.appliedSkill : undefined,
      message: `${brute.name} ha subido al nivel ${brute.level}! Experiencia restante: ${brute.xp}`
    };
  }
  /**
   * Aplica la gratificación específica elegida por el jugador
   */
  private async applyGratification(bruteId: number, choice: GratificationChoiceDto, newLevel: number) {
    // Para stat_boost: "stat_boost_5" -> necesitamos el último elemento
    // Para weapon: "weapon_3" -> necesitamos el segundo elemento
    // Para skill: "skill_7" -> necesitamos el segundo elemento
    const parts = choice.id.split('_');
    const realId = choice.type === 'stat_boost' ? 
      parseInt(parts[parts.length - 1]) : // Para stat_boost toma el último elemento
      parseInt(parts[1]); // Para weapon y skill toma el segundo elemento

    if (isNaN(realId)) {
      throw new BadRequestException(`ID de gratificación inválido: ${choice.id}`);
    }

    switch (choice.type) {
      case 'stat_boost':
        return await this.applyStatBoost(bruteId, realId);
      case 'weapon':
        return await this.applyWeapon(bruteId, realId);
      case 'skill':
        return await this.applySkill(bruteId, realId);
      default:
        throw new BadRequestException(`Tipo de gratificación desconocido: ${choice.type}`);
    }
  }

  /**
   * Aplica una mejora de stats al bruto
   */
  private async applyStatBoost(bruteId: number, statBoostId: number) {
    const statBoost = await this.statBoostPossibilityRepository.findOne({
      where: { id: statBoostId }
    });

    if (!statBoost) {
      throw new NotFoundException('Stat boost no encontrado');
    }

    const brute = await this.bruteService.getBruteById(bruteId);
    if (!brute || !brute.stats || brute.stats.length === 0) {
      throw new NotFoundException('Estadísticas del bruto no encontradas');
    }

    // Actualizar las estadísticas del bruto
    const stat = brute.stats[0];
    stat.hp += statBoost.hp || 0;
    stat.strenght += statBoost.strength || 0;
    stat.endurance += statBoost.resistance || 0;
    stat.agility += statBoost.speed || 0;
    stat.intelligence += statBoost.intelligence || 0;
    
    await this.statRepository.save(stat);

    return {
      description: `Aplicado: ${this.getStatBoostDescription(statBoost)}`,
      appliedStats: {
        hp: statBoost.hp || 0,
        strength: statBoost.strength || 0,
        resistance: statBoost.resistance || 0,
        speed: statBoost.speed || 0,
        intelligence: statBoost.intelligence || 0
      }
    };
  }

  /**
   * Aplica un arma al bruto
   */
  private async applyWeapon(bruteId: number, weaponId: number) {
    const weapon = await this.gratificationRepository.findOne({
      where: { id: weaponId, type: 'weapon' }
    });

    if (!weapon) {
      throw new NotFoundException('Arma no encontrada');
    }

    // Verificar que el bruto no tenga ya esta arma
    const brute = await this.bruteService.getBruteById(bruteId);
    const hasWeapon = brute?.bruteWeapons?.some(bw => bw.weapon.id === weaponId);
    
    if (hasWeapon) {
      throw new BadRequestException('El bruto ya posee esta arma');
    }

    // Aquí deberías implementar la lógica para agregar el arma al bruto
    // Por ahora solo retornamos la información

    return {
      description: `Nueva arma obtenida: ${weapon.name}`,
      appliedWeapon: {
        id: weapon.id,
        name: weapon.name,
        stats: weapon.value_json
      }
    };
  }

  /**
   * Aplica una habilidad al bruto
   */
  private async applySkill(bruteId: number, skillId: number) {
    const skill = await this.gratificationRepository.findOne({
      where: { id: skillId, type: 'skill' }
    });

    if (!skill) {
      throw new NotFoundException('Habilidad no encontrada');
    }

    // Verificar que el bruto no tenga ya esta habilidad
    const brute = await this.bruteService.getBruteById(bruteId);
    const hasSkill = brute?.bruteSkills?.some(bs => bs.skill.id === skillId);
    
    if (hasSkill) {
      throw new BadRequestException('El bruto ya posee esta habilidad');
    }

    // Aquí deberías implementar la lógica para agregar la habilidad al bruto
    // Por ahora solo retornamos la información

    return {
      description: `Nueva habilidad obtenida: ${skill.name}`,
      appliedSkill: {
        id: skill.id,
        name: skill.name,
        effects: skill.value_json
      }
    };
  }
  /**
   * Registra la elección de gratificación en la base de datos
   */
  private async recordLevelChoice(bruteId: number, level: number, choice: GratificationChoiceDto) {
    // Para stat_boost: "stat_boost_5" -> necesitamos el último elemento
    // Para weapon: "weapon_3" -> necesitamos el segundo elemento  
    // Para skill: "skill_7" -> necesitamos el segundo elemento
    const parts = choice.id.split('_');
    const realId = choice.type === 'stat_boost' ? 
      parseInt(parts[parts.length - 1]) : // Para stat_boost toma el último elemento
      parseInt(parts[1]); // Para weapon y skill toma el segundo elemento
    
    const choiceEntity = this.bruteLevelChoiceRepository.create({
      brute: { id: bruteId },
      level: level,
      gratification: { id: realId }
    });
    
    await this.bruteLevelChoiceRepository.save(choiceEntity);
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Genera un nombre para una combinación de stat boost
   */
  private getStatBoostName(statBoost: StatBoostPossibility): string {
    const stats: string[] = [];
    if (statBoost.hp > 0) stats.push('HP');
    if (statBoost.strength > 0) stats.push('Fuerza');
    if (statBoost.resistance > 0) stats.push('Resistencia');
    if (statBoost.speed > 0) stats.push('Velocidad');
    if (statBoost.intelligence > 0) stats.push('Inteligencia');

    if (stats.length === 1) {
      return `Mejora de ${stats[0]}`;
    } else if (stats.length === 2) {
      return `${stats[0]} y ${stats[1]}`;
    } else {
      return `Mejora Múltiple (${stats.length} stats)`;
    }
  }

  /**
   * Genera descripción para una posibilidad de stat boost
   */
  private getStatBoostDescription(statBoost: StatBoostPossibility): string {
    const improvements: string[] = [];
    if (statBoost.hp > 0) improvements.push(`+${statBoost.hp} HP`);
    if (statBoost.strength > 0) improvements.push(`+${statBoost.strength} Fuerza`);
    if (statBoost.resistance > 0) improvements.push(`+${statBoost.resistance} Resistencia`);
    if (statBoost.speed > 0) improvements.push(`+${statBoost.speed} Velocidad`);
    if (statBoost.intelligence > 0) improvements.push(`+${statBoost.intelligence} Inteligencia`);    return improvements.join(', ');
  }

  /**
   * MÉTODO TEMPORAL DE DIAGNÓSTICO - Verificar inconsistencias en gratificaciones
   */
  async checkGratificationsConsistency() {
    try {
      // Verificar gratificaciones de tipo weapon que no tienen referencia en tabla weapons
      const weaponGratifications = await this.gratificationRepository.find({
        where: { type: 'weapon' }
      });

      // Verificar gratificaciones de tipo skill que no tienen referencia en tabla skills  
      const skillGratifications = await this.gratificationRepository.find({
        where: { type: 'skill' }
      });

      // Verificar stat_boost_possibilities existentes
      const statBoosts = await this.statBoostPossibilityRepository.find();

      const result = {
        weaponGratifications: weaponGratifications.map(w => ({
          id: w.id,
          name: w.name,
          type: w.type,
          min_level: w.min_level,
          value_json: w.value_json
        })),
        skillGratifications: skillGratifications.map(s => ({
          id: s.id,
          name: s.name,
          type: s.type,
          min_level: s.min_level,
          value_json: s.value_json
        })),
        statBoosts: statBoosts.map(sb => ({
          id: sb.id,
          hp: sb.hp,
          strength: sb.strength,
          resistance: sb.resistance,
          speed: sb.speed,
          intelligence: sb.intelligence,
          min_level: sb.min_level
        })),
        summary: {
          totalWeapons: weaponGratifications.length,
          totalSkills: skillGratifications.length,
          totalStatBoosts: statBoosts.length
        }
      };

      return result;

    } catch (error) {
      console.error('Error en diagnóstico de gratificaciones:', error);
      throw new BadRequestException('Error al verificar consistencia de gratificaciones');
    }
  }
}
