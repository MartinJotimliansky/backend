import { Stat } from '../brute/stat.entity';

export interface StatModifiers {
  baseDamageBonus: number;
  weaponDamageMultiplier: number;
  damageReduction: number;
  maxHpBonus: number;
  blockChancePercent: number;
  dodgeChancePercent: number;
  counterChancePercent: number;
  comboChancePercent: number;
  doubleTurnChancePercent: number;
  skillPowerMultiplier: number;
}

export class StatCalculator {
  public static calculateModifiers(stats: Stat): StatModifiers {
    return {
      // Strength modifiers
      baseDamageBonus: stats.strenght * 0.85,
      weaponDamageMultiplier: 1 + (stats.strenght * 0.011), // +1.1% per point

      // Endurance modifiers
      damageReduction: stats.endurance * 0.85,
      maxHpBonus: stats.endurance * 2,
      blockChancePercent: stats.endurance * 2,

      // Agility modifiers
      dodgeChancePercent: stats.agility * 3,
      counterChancePercent: stats.agility * 2,
      comboChancePercent: stats.agility * 3,
      doubleTurnChancePercent: stats.agility * 3,

      // Intelligence modifiers
      skillPowerMultiplier: 1 + (stats.intelligence * 0.05), // +5% per point
    };
  }

  public static calculateFinalDamage(
    baseDamage: number, 
    attackerStats: Stat,
    defenderStats: Stat,
    isWeaponAttack: boolean = true
  ): number {
    const attackerMods = this.calculateModifiers(attackerStats);
    const defenderMods = this.calculateModifiers(defenderStats);

    // Apply base damage bonus from strength
    let damage = baseDamage + attackerMods.baseDamageBonus;

    // Apply weapon damage multiplier if it's a weapon attack
    if (isWeaponAttack) {
      damage *= attackerMods.weaponDamageMultiplier;
    }

    // Apply damage reduction from defender's endurance
    damage = Math.max(0, damage - defenderMods.damageReduction);

    return Math.round(damage);
  }

  public static calculateMaxHp(baseHp: number, stats: Stat): number {
    const mods = this.calculateModifiers(stats);
    return baseHp + mods.maxHpBonus;
  }

  public static rollProbability(percent: number): boolean {
    return Math.random() * 100 < percent;
  }

  public static checkBlock(stats: Stat): boolean {
    const mods = this.calculateModifiers(stats);
    return this.rollProbability(mods.blockChancePercent);
  }

  public static checkDodge(stats: Stat): boolean {
    const mods = this.calculateModifiers(stats);
    return this.rollProbability(mods.dodgeChancePercent);
  }

  public static checkCounter(stats: Stat): boolean {
    const mods = this.calculateModifiers(stats);
    return this.rollProbability(mods.counterChancePercent);
  }

  public static checkCombo(stats: Stat): boolean {
    const mods = this.calculateModifiers(stats);
    return this.rollProbability(mods.comboChancePercent);
  }

  public static checkDoubleTurn(stats: Stat): boolean {
    const mods = this.calculateModifiers(stats);
    return this.rollProbability(mods.doubleTurnChancePercent);
  }

  public static calculateSkillPower(baseValue: number, stats: Stat): number {
    const mods = this.calculateModifiers(stats);
    return Math.round(baseValue * mods.skillPowerMultiplier);
  }
}
