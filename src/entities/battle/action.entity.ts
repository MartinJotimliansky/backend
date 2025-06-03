import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ActionType {
  BASIC_ATTACK = 'BASIC_ATTACK',       // Puñetazo
  DRAW_WEAPON = 'DRAW_WEAPON',         // Sacar arma
  WEAPON_ATTACK = 'WEAPON_ATTACK',     // Pegar con arma
  THROW_WEAPON = 'THROW_WEAPON',       // Lanzar arma
  DODGE = 'DODGE',                     // Esquivar
  COUNTER = 'COUNTER',                 // Contraatacar
  SKILL = 'SKILL',                     // Usar habilidad
  COMBO = 'COMBO'                      // Combo (será una acción más)
}

export enum ActionRequirement {
  NONE = 'NONE',               // No requiere nada especial
  WEAPON = 'WEAPON',           // Requiere tener un arma
  WEAPON_DRAWN = 'WEAPON_DRAWN',// Requiere tener arma sacada
  SKILL = 'SKILL'             // Requiere una habilidad específica
}

@Entity('actions')
export class Action {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'varchar' })
    requirement: string;

    @Column({ type: 'integer' })
    value: number;

    @Column({ type: 'float', default: 1.0 })
    probability: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    // Métodos de ayuda para validar los tipos
    isValidType(): boolean {
        return Object.values(ActionType).includes(this.type as ActionType);
    }

    isValidRequirement(): boolean {
        return Object.values(ActionRequirement).includes(this.requirement as ActionRequirement);
    }
}
