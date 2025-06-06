import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelExperience } from '../../entities/battle/level_experience.entity';
import { Gratification } from '../../entities/battle/gratification.entity';
import { StatBoostPossibility } from '../../entities/battle/stat_boost_possibility.entity';
import { BruteLevelChoice } from '../../entities/brute/brute_level_choice.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Brute } from '../../entities/brute/brute.entity';
import { BruteService } from '../brute/brute.service';

export interface GratificationOption {
  id: string;
  type: 'stat_boost' | 'weapon' | 'skill';
  name: string;
  description: string;
  data: StatBoostPossibility | Gratification;
}

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(LevelExperience)
    private levelExperienceRepository: Repository<LevelExperience>,
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
    private bruteService: BruteService,
  ) {}

  /**
   * Calcula la experiencia ganada por un resultado de combate
   * @param won - true si ganó el combate, false si perdió
   * @returns cantidad de experiencia ganada
   */
  calculateExperienceGain(won: boolean): number {
    return won ? 2 : 1; // Ganar: 2 exp, Perder: 1 exp
  }
  /**
   * Calcula el nivel basado en la experiencia total
   * Implementa la fórmula: nivel 1→2 necesita 5 exp, cada nivel siguiente +1 exp más
   * @param totalExperience - experiencia total del jugador
   * @returns nivel actual
   */
  calculateLevelFromExperience(totalExperience: number): number {
    if (totalExperience < 5) return 1;
    
    // Búsqueda iterativa para encontrar el nivel correcto
    for (let level = 2; level <= 50; level++) {
      const expForLevel = this.calculateExperienceForLevel(level);
      if (totalExperience < expForLevel) {
        return level - 1;
      }
      if (totalExperience === expForLevel) {
        return level;
      }
    }
    
    return 50; // Nivel máximo
  }  /**
   * Calcula la experiencia requerida para un nivel específico
   * @param level - nivel objetivo
   * @returns experiencia total requerida para alcanzar ese nivel
   */
  calculateExperienceForLevel(level: number): number {
    if (level <= 1) return 0;
    if (level === 2) return 5;
    
    // Análisis correcto de la progresión del SQL:
    // Nivel 2: 5 total
    // Nivel 3: 11 total (necesita 6 para subir)
    // Nivel 4: 18 total (necesita 7 para subir)
    // Nivel 5: 26 total (necesita 8 para subir)
    //
    // Fórmula correcta: 5 + sum(5+i, i=1 to level-2)
    // = 5 + 6 + 7 + 8 + ... + (5+(level-2))
    
    let total = 5; // Base para nivel 2
    for (let i = 1; i <= level - 2; i++) {
      total += 5 + i; // 6, 7, 8, 9, etc.
    }
    return total;
  }

  /**
   * Obtiene la experiencia requerida para el siguiente nivel
   * @param currentLevel - nivel actual
   * @returns experiencia necesaria para subir al siguiente nivel
   */
  getExperienceToNextLevel(currentLevel: number): number {
    if (currentLevel >= 50) return 0; // Nivel máximo alcanzado
    
    return 5 + (currentLevel - 1); // Fórmula: 5 para nivel 2, luego +1 cada nivel
  }

  /**
   * Obtiene información completa del nivel basada en la experiencia
   * @param totalExperience - experiencia total del jugador
   * @returns objeto con información del nivel
   */
  async getLevelInfo(totalExperience: number) {
    const currentLevel = this.calculateLevelFromExperience(totalExperience);
    const currentLevelExp = this.calculateExperienceForLevel(currentLevel);
    const nextLevelExp = this.calculateExperienceForLevel(currentLevel + 1);
    const expToNext = this.getExperienceToNextLevel(currentLevel);
    const expInCurrentLevel = totalExperience - currentLevelExp;

    return {
      level: currentLevel,
      totalExperience,
      experienceInCurrentLevel: expInCurrentLevel,
      experienceToNextLevel: Math.max(0, expToNext - expInCurrentLevel),
      experienceRequiredForNextLevel: expToNext,
      isMaxLevel: currentLevel >= 50,
      progressPercentage: currentLevel >= 50 ? 100 : 
        Math.round((expInCurrentLevel / expToNext) * 100)
    };
  }

  /**
   * Actualiza la experiencia de un bruto y devuelve si subió de nivel
   * @param currentExperience - experiencia actual
   * @param combatResult - true si ganó, false si perdió
   * @returns información sobre el cambio de nivel
   */
  async updateExperience(currentExperience: number, combatResult: boolean) {
    const expGain = this.calculateExperienceGain(combatResult);
    const oldLevel = this.calculateLevelFromExperience(currentExperience);
    const newExperience = currentExperience + expGain;
    const newLevel = this.calculateLevelFromExperience(newExperience);
    
    const leveledUp = newLevel > oldLevel;
    
    return {
      oldLevel,
      newLevel,
      oldExperience: currentExperience,
      newExperience,
      experienceGained: expGain,
      leveledUp,
      levelInfo: await this.getLevelInfo(newExperience)
    };
  }

  /**
   * Obtiene todos los datos de nivel desde la base de datos (para referencia)
   * @returns array con todos los niveles y sus requisitos de experiencia
   */
  async getAllLevelData(): Promise<LevelExperience[]> {
    return this.levelExperienceRepository.find({
      order: { level: 'ASC' }
    });
  }

  /**
   * Valida que los datos calculados coincidan con los de la base de datos
   * @returns true si coinciden, false si hay discrepancias
   */
  async validateLevelData(): Promise<boolean> {
    const dbData = await this.getAllLevelData();
    
    for (const entry of dbData) {
      const calculatedExp = this.calculateExperienceForLevel(entry.level);
      if (calculatedExp !== entry.experience) {
        console.error(`Discrepancia en nivel ${entry.level}: calculado=${calculatedExp}, db=${entry.experience}`);
        return false;
      }
    }
    
    return true;
  }

  // Métodos de compatibilidad con el sistema existente
  /**
   * Obtiene el nivel basado en la experiencia actual (versión async para compatibilidad)
   */
  async getLevelFromExperience(currentExperience: number): Promise<number> {
    return this.calculateLevelFromExperience(currentExperience);
  }

  /**
   * Obtiene la experiencia requerida para un nivel específico (versión async para compatibilidad)
   */
  async getExperienceForLevel(level: number): Promise<number> {
    return this.calculateExperienceForLevel(level);
  }

  /**
   * Verifica si un bruto puede subir de nivel (tiene experiencia suficiente pero no ha elegido gratificación)
   * @param currentExperience - experiencia actual del bruto
   * @param currentLevel - nivel actual del bruto
   * @returns true si puede subir de nivel
   */
  canLevelUp(currentExperience: number, currentLevel: number): boolean {
    const calculatedLevel = this.calculateLevelFromExperience(currentExperience);
    return calculatedLevel > currentLevel;
  }

  /**
   * Verifica si un bruto debe ser bloqueado para combatir (necesita subir de nivel)
   * @param currentExperience - experiencia actual del bruto
   * @param currentLevel - nivel actual del bruto
   * @returns true si debe ser bloqueado hasta que suba de nivel
   */
  isBlockedForCombat(currentExperience: number, currentLevel: number): boolean {
    return this.canLevelUp(currentExperience, currentLevel);
  }
  /**
   * Aplica una gratificación y sube al bruto de nivel
   * @param gratificationId - ID de la gratificación elegida
   * @param currentLevel - nivel actual del bruto
   * @returns información sobre la gratificación aplicada
   */
  async applyGratification(gratificationId: number, currentLevel: number) {
    const gratification = await this.gratificationRepository.findOne({
      where: { id: gratificationId }
    });

    if (!gratification) {
      throw new Error('Gratificación no encontrada');
    }

    if (gratification.min_level > currentLevel + 1) {
      throw new Error('Gratificación no disponible para este nivel');
    }

    // Aquí se aplicaría la gratificación al bruto (stats, armas, habilidades)
    // Esto dependerá de la implementación específica de cada tipo de gratificación

    return {
      newLevel: currentLevel + 1,
      appliedGratification: gratification,
      gratificationType: gratification.type,
      gratificationValue: gratification.value_json
    };
  }

  /**
   * Obtiene el progreso de nivel incluyendo información sobre si puede subir
   * @param currentExperience - experiencia actual
   * @param currentLevel - nivel actual del bruto
   * @returns información completa del progreso incluyendo estado de subida
   */
  async getDetailedLevelInfo(currentExperience: number, currentLevel: number) {
    const levelInfo = await this.getLevelInfo(currentExperience);
    const canLevelUp = this.canLevelUp(currentExperience, currentLevel);
    const isBlocked = this.isBlockedForCombat(currentExperience, currentLevel);

    return {
      ...levelInfo,
      currentLevel, // Nivel real del bruto (puede ser diferente al calculado)
      canLevelUp,
      isBlockedForCombat: isBlocked,
      needsGratificationChoice: canLevelUp
    };
  }

  /**
   * Simula la aplicación de una gratificación para previsualización
   * @param gratificationId - ID de la gratificación
   * @returns información sobre qué haría la gratificación
   */
  async previewGratification(gratificationId: number) {
    const gratification = await this.gratificationRepository.findOne({
      where: { id: gratificationId }
    });

    if (!gratification) {
      throw new Error('Gratificación no encontrada');
    }

    return {
      id: gratification.id,
      name: gratification.name,
      type: gratification.type,
      description: this.getGratificationDescription(gratification),
      value: gratification.value_json
    };
  }
  /**
   * Genera una descripción legible de una gratificación
   * @param gratification - objeto gratificación
   * @returns descripción en texto
   */
  private getGratificationDescription(gratification: Gratification): string {
    switch (gratification.type) {
      case 'stat_boost':
        const stats = gratification.value_json;
        const statNames = {
          strength: 'Fuerza',
          agility: 'Agilidad',
          intellect: 'Intelecto',
          endurance: 'Resistencia'
        };
        const boosts = Object.entries(stats)
          .map(([stat, value]) => `+${value} ${statNames[stat] || stat}`)
          .join(', ');
        return `Mejora de estadísticas: ${boosts}`;
      
      case 'weapon':
        return `Nueva arma: ${gratification.name}`;
      
      case 'skill':
        return `Nueva habilidad: ${gratification.name}`;
      
      default:
        return gratification.name;
    }
  }  /**
   * Obtiene las 3 gratificaciones disponibles para elegir al subir de nivel
   * Incluye: stat boosts, armas y habilidades
   * @param level - nivel del jugador
   * @returns array de 3 gratificaciones para elegir
   */
  async getAvailableGratifications(level: number): Promise<GratificationOption[]> {
    // Obtener stat boosts disponibles para este nivel
    const statBoosts = await this.statBoostPossibilityRepository
      .createQueryBuilder('sbp')
      .where('sbp.min_level <= :level', { level })
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    // Obtener armas disponibles
    const weapons = await this.gratificationRepository
      .createQueryBuilder('g')
      .where('g.min_level <= :level', { level })
      .andWhere('g.type = :type', { type: 'weapon' })
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    // Obtener habilidades disponibles
    const skills = await this.gratificationRepository
      .createQueryBuilder('g')
      .where('g.min_level <= :level', { level })
      .andWhere('g.type = :type', { type: 'skill' })
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    // Formatear las opciones
    const options: GratificationOption[] = [];

    // Agregar stat boost si existe
    if (statBoosts.length > 0) {
      const sb = statBoosts[0];
      options.push({
        id: `stat_boost_${sb.id}`,
        type: 'stat_boost',
        name: this.getStatBoostName(sb),
        description: this.getStatBoostDescription(sb),
        data: sb
      });
    }

    // Agregar arma si existe
    if (weapons.length > 0) {
      const weapon = weapons[0];
      options.push({
        id: `weapon_${weapon.id}`,
        type: 'weapon',
        name: weapon.name,
        description: `Nueva arma: ${weapon.name}`,
        data: weapon
      });
    }

    // Agregar habilidad si existe
    if (skills.length > 0) {
      const skill = skills[0];
      options.push({
        id: `skill_${skill.id}`,
        type: 'skill',
        name: skill.name,
        description: `Nueva habilidad: ${skill.name}`,
        data: skill
      });
    }    // Si tenemos menos de 3, completar con más stat boosts
    while (options.length < 3) {
      const excludeIds = options
        .filter(o => o.type === 'stat_boost')
        .map(o => parseInt(o.id.split('_')[2]));
      
      let query = this.statBoostPossibilityRepository
        .createQueryBuilder('sbp')
        .where('sbp.min_level <= :level', { level });
      
      if (excludeIds.length > 0) {
        query = query.andWhere('sbp.id NOT IN (:...excludeIds)', { excludeIds });
      }
      
      const additionalStatBoosts = await query
        .orderBy('RANDOM()')
        .limit(1)
        .getMany();

      if (additionalStatBoosts.length > 0) {
        const sb = additionalStatBoosts[0];
        options.push({
          id: `stat_boost_${sb.id}`,
          type: 'stat_boost',
          name: this.getStatBoostName(sb),
          description: this.getStatBoostDescription(sb),
          data: sb
        });
      } else {
        break; // No hay más stat boosts disponibles
      }
    }

    return options.slice(0, 3); // Asegurar que solo devolvemos 3
  }
  /**
   * Genera un nombre para una combinación de stat boost
   * @param statBoost - objeto de stat boost
   * @returns nombre descriptivo
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
   * @param statBoost - posibilidad de stat boost
   * @returns descripción legible
   */
  private getStatBoostDescription(statBoost: StatBoostPossibility): string {
    const improvements: string[] = [];
    if (statBoost.hp > 0) improvements.push(`+${statBoost.hp} HP`);
    if (statBoost.strength > 0) improvements.push(`+${statBoost.strength} Fuerza`);
    if (statBoost.resistance > 0) improvements.push(`+${statBoost.resistance} Resistencia`);
    if (statBoost.speed > 0) improvements.push(`+${statBoost.speed} Velocidad`);
    if (statBoost.intelligence > 0) improvements.push(`+${statBoost.intelligence} Inteligencia`);

    return improvements.join(', ');
  }

  /**
   * Aplica la gratificación elegida al bruto
   * @param gratificationChoice - objeto con tipo e ID de la gratificación
   * @param bruteLevel - nivel actual del bruto (se incrementará a nivel + 1)
   * @returns información sobre lo que se aplicó
   */
  async applyChosenGratification(gratificationChoice: any, bruteLevel: number) {
    const { type, id } = gratificationChoice;
    const realId = parseInt(id.split('_')[1]); // Extraer ID real del formato "tipo_id"

    switch (type) {
      case 'stat_boost':
        return await this.applyStatBoost(realId, bruteLevel);
      
      case 'weapon':
        return await this.applyWeapon(realId, bruteLevel);
      
      case 'skill':
        return await this.applySkill(realId, bruteLevel);
      
      default:
        throw new Error(`Tipo de gratificación desconocido: ${type}`);
    }
  }

  /**
   * Aplica una mejora de stats al bruto
   * @param statBoostId - ID del stat boost
   * @param currentLevel - nivel actual del bruto
   * @returns información sobre los stats aplicados
   */
  async applyStatBoost(statBoostId: number, currentLevel: number) {
    const statBoost = await this.statBoostPossibilityRepository.findOne({
      where: { id: statBoostId }
    });

    if (!statBoost) {
      throw new Error('Stat boost no encontrado');
    }

    if (statBoost.min_level > currentLevel + 1) {
      throw new Error('Stat boost no disponible para este nivel');
    }

    return {
      newLevel: currentLevel + 1,
      type: 'stat_boost',
      appliedStats: {
        hp: statBoost.hp,
        strength: statBoost.strength,
        resistance: statBoost.resistance,
        speed: statBoost.speed,
        intelligence: statBoost.intelligence
      },
      description: `Aplicado: ${this.getStatBoostDescription(statBoost)}`
    };
  }

  /**
   * Aplica un arma al bruto
   * @param weaponId - ID del arma (gratificación)
   * @param currentLevel - nivel actual del bruto
   * @returns información sobre el arma aplicada
   */
  async applyWeapon(weaponId: number, currentLevel: number) {
    const weapon = await this.gratificationRepository.findOne({
      where: { id: weaponId, type: 'weapon' }
    });

    if (!weapon) {
      throw new Error('Arma no encontrada');
    }

    if (weapon.min_level > currentLevel + 1) {
      throw new Error('Arma no disponible para este nivel');
    }

    return {
      newLevel: currentLevel + 1,
      type: 'weapon',
      appliedWeapon: {
        id: weapon.id,
        name: weapon.name,
        stats: weapon.value_json
      },
      description: `Nueva arma obtenida: ${weapon.name}`
    };
  }

  /**
   * Aplica una habilidad al bruto
   * @param skillId - ID de la habilidad (gratificación)
   * @param currentLevel - nivel actual del bruto
   * @returns información sobre la habilidad aplicada
   */
  async applySkill(skillId: number, currentLevel: number) {
    const skill = await this.gratificationRepository.findOne({
      where: { id: skillId, type: 'skill' }
    });

    if (!skill) {
      throw new Error('Habilidad no encontrada');
    }

    if (skill.min_level > currentLevel + 1) {
      throw new Error('Habilidad no disponible para este nivel');
    }

    return {
      newLevel: currentLevel + 1,
      type: 'skill',
      appliedSkill: {
        id: skill.id,
        name: skill.name,
        effects: skill.value_json
      },
      description: `Nueva habilidad obtenida: ${skill.name}`
    };
  }

  /**
   * Obtiene información completa de nivel para un bruto específico
   * @param bruteId - ID del bruto
   * @returns información detallada del nivel y experiencia
   */
  async getBruteLevelInfo(bruteId: number) {
    const brute = await this.bruteService.getBruteById(bruteId);
    
    if (!brute) {
      throw new Error('Bruto no encontrado');
    }

    const currentLevel = brute.level;
    const currentExperience = brute.xp;
    
    // Obtener experiencia requerida para el nivel actual
    const currentLevelExp = await this.levelExperienceRepository.findOne({
      where: { level: currentLevel }
    });
    
    // Obtener experiencia requerida para el siguiente nivel
    const nextLevelExp = await this.levelExperienceRepository.findOne({
      where: { level: currentLevel + 1 }
    });
    
    const currentLevelBaseExp = currentLevel === 1 ? 0 : (currentLevelExp?.experience || this.calculateExperienceForLevel(currentLevel));
    const nextLevelRequiredExp = nextLevelExp?.experience || this.calculateExperienceForLevel(currentLevel + 1);
    
    // Calcular progreso en el nivel actual
    let experienceInCurrentLevel = 0;
    let experienceNeededForNextLevel = 0;
    let progressPercentage = 0;
    let canLevelUp = false;
    
    if (currentLevel < 50 && nextLevelRequiredExp !== null) {
      experienceInCurrentLevel = currentExperience - currentLevelBaseExp;
      experienceNeededForNextLevel = nextLevelRequiredExp - currentLevelBaseExp;
      progressPercentage = Math.floor((experienceInCurrentLevel / experienceNeededForNextLevel) * 100);
      canLevelUp = currentExperience >= nextLevelRequiredExp;
    } else {
      // Nivel máximo alcanzado
      progressPercentage = 100;
    }    return {
      bruteId: brute.id,
      bruteName: brute.name,
      currentLevel,
      currentXp: currentExperience,
      currentLevelXp: currentLevelBaseExp,
      nextLevelXp: nextLevelRequiredExp,
      progressPercentage,
      canLevelUp,
      blockedFromCombat: canLevelUp,
      isMaxLevel: currentLevel >= 50
    };
  }
  /**
   * Automatically levels up a brute by choosing the first available stat boost
   * @param bruteId - ID of the brute to level up
   * @returns information about the level up result
   */
  async autoLevelUp(bruteId: number) {
    const brute = await this.bruteService.getBruteById(bruteId);
    if (!brute) {
      throw new Error('Brute not found');
    }

    const levelInfo = await this.getBruteLevelInfo(bruteId);
    if (!levelInfo.canLevelUp) {
      throw new Error('Brute cannot level up yet');
    }

    // Get available gratifications for the next level
    const gratifications = await this.getAvailableGratifications(brute.level + 1);
    
    // Find the first stat boost option
    const statBoostOption = gratifications.find(g => g.type === 'stat_boost');
    if (!statBoostOption) {
      throw new Error('No stat boost options available');
    }

    // Apply the chosen gratification
    const gratificationChoice = {
      id: `stat_boost_${statBoostOption.data.id}`,
      type: 'stat_boost' as const
    };

    const result = await this.applyChosenGratification(gratificationChoice, brute.level);

    // Update brute level and stats in database
    await this.updateBruteAfterLevelUp(bruteId, brute.level + 1, statBoostOption.data);

    return {
      success: true,
      newLevel: brute.level + 1,
      appliedGratification: result,
      message: `${brute.name} has leveled up to level ${brute.level + 1}!`
    };
  }

  /**
   * Updates brute data after level up
   * @param bruteId - ID of the brute
   * @param newLevel - new level
   * @param statBoost - stat boost to apply
   */
  private async updateBruteAfterLevelUp(bruteId: number, newLevel: number, statBoost: any) {
    const brute = await this.bruteService.getBruteById(bruteId);
    if (!brute) {
      throw new Error('Brute not found');
    }

    // Update brute level
    brute.level = newLevel;
    await this.bruteRepository.save(brute);

    // Update brute stats - access the first stat entry
    if (brute.stats && brute.stats.length > 0) {
      const stat = brute.stats[0];
      stat.hp += statBoost.hp || 0;
      stat.strenght += statBoost.strength || 0;
      stat.endurance += statBoost.resistance || 0;
      stat.agility += statBoost.speed || 0;
      stat.intelligence += statBoost.intelligence || 0;
      
      await this.statRepository.save(stat);
    }

    // Record the choice in brute_level_choices
    const choiceEntity = this.bruteLevelChoiceRepository.create({
      brute: { id: bruteId },
      level: newLevel,
      gratification: { id: statBoost.id }
    });
    await this.bruteLevelChoiceRepository.save(choiceEntity);
  }
}
