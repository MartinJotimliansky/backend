import { Injectable } from '@nestjs/common';
import { Brute } from '../../entities/brute/brute.entity';
import { Skill } from '../../entities/items/skill.entity';
import { Weapon } from '../../entities/items/weapon.entity';

/**
 * Servicio para manejar skills y weapons usando campos JSON
 */
@Injectable()
export class BruteJsonService {

  /**
   * Agregar una skill a un brute
   */
  addSkillToBrute(brute: Brute, skillId: number, config?: any): void {
    if (!brute.skill_ids) {
      brute.skill_ids = [];
    }
    if (!brute.skill_ids.includes(skillId)) {
      brute.skill_ids.push(skillId);
      // Forzar a TypeORM a detectar el cambio
      brute.skill_ids = [...brute.skill_ids];
      if (config) {
        if (!brute.skill_config) {
          brute.skill_config = {};
        }
        brute.skill_config[skillId] = config;
      }
      // DEBUG LOG
      console.log(`[BruteJsonService] Skill ${skillId} added to brute ${brute.id}. Current skills:`, brute.skill_ids);
    } else {
      // DEBUG LOG
      console.log(`[BruteJsonService] Skill ${skillId} already present for brute ${brute.id}.`);
    }
  }

  /**
   * Remover una skill de un brute
   */
  removeSkillFromBrute(brute: Brute, skillId: number): void {
    if (brute.skill_ids) {
      brute.skill_ids = brute.skill_ids.filter(id => id !== skillId);
      
      if (brute.skill_config && brute.skill_config[skillId]) {
        delete brute.skill_config[skillId];
      }
    }
  }

  /**
   * Verificar si un brute tiene una skill
   */
  bruteHasSkill(brute: Brute, skillId: number): boolean {
    return brute.skill_ids?.includes(skillId) || false;
  }

  /**
   * Obtener configuración de una skill
   */
  getSkillConfig(brute: Brute, skillId: number): any {
    return brute.skill_config?.[skillId] || null;
  }

  /**
   * Agregar un weapon a un brute
   */
  addWeaponToBrute(brute: Brute, weaponId: number, equipped: boolean = false): void {
    if (!brute.weapon_ids) {
      brute.weapon_ids = [];
    }
    
    if (!brute.weapon_ids.includes(weaponId)) {
      brute.weapon_ids.push(weaponId);
      
      if (!brute.weapon_config) {
        brute.weapon_config = {};
      }
      brute.weapon_config[weaponId] = { equipped };
    }
  }

  /**
   * Remover un weapon de un brute
   */
  removeWeaponFromBrute(brute: Brute, weaponId: number): void {
    if (brute.weapon_ids) {
      brute.weapon_ids = brute.weapon_ids.filter(id => id !== weaponId);
      
      if (brute.weapon_config && brute.weapon_config[weaponId]) {
        delete brute.weapon_config[weaponId];
      }
    }
  }

  /**
   * Verificar si un brute tiene un weapon
   */
  bruteHasWeapon(brute: Brute, weaponId: number): boolean {
    return brute.weapon_ids?.includes(weaponId) || false;
  }

  /**
   * Verificar si un weapon está equipado
   */
  isWeaponEquipped(brute: Brute, weaponId: number): boolean {
    return brute.weapon_config?.[weaponId]?.equipped || false;
  }

  /**
   * Equipar/desequipar un weapon
   */
  setWeaponEquipped(brute: Brute, weaponId: number, equipped: boolean): void {
    if (this.bruteHasWeapon(brute, weaponId)) {
      if (!brute.weapon_config) {
        brute.weapon_config = {};
      }
      if (!brute.weapon_config[weaponId]) {
        brute.weapon_config[weaponId] = {};
      }
      brute.weapon_config[weaponId].equipped = equipped;
    }
  }

  /**
   * Obtener todos los IDs de skills de un brute
   */
  getBruteSkillIds(brute: Brute): number[] {
    return brute.skill_ids || [];
  }

  /**
   * Obtener todos los IDs de weapons de un brute
   */
  getBruteWeaponIds(brute: Brute): number[] {
    return brute.weapon_ids || [];
  }

  
}
