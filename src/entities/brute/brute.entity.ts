import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user.entity';
import { Stat } from './stat.entity';
import { BruteLevelChoice } from './brute_level_choice.entity';
import { BruteSkill } from './brute_skill.entity';
import { BruteWeapon } from './brute_weapon.entity';
import { BruteCosmetic } from './brute_cosmetic.entity';
import { Purchase } from '../items/purchase.entity';
import { Battle } from '../battle/battle.entity';

@Entity('brutes')
export class Brute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.brutes)
  user: User;

  @Column()
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 0 })
  gold: number;

  @OneToMany(() => Stat, stat => stat.brute)
  stats: Stat[];

  @OneToMany(() => BruteLevelChoice, choice => choice.brute)
  levelChoices: BruteLevelChoice[];

  @OneToMany(() => BruteSkill, bruteSkill => bruteSkill.brute)
  bruteSkills: BruteSkill[];

  @OneToMany(() => BruteWeapon, bruteWeapon => bruteWeapon.brute)
  bruteWeapons: BruteWeapon[];

  @OneToMany(() => BruteCosmetic, bruteCosmetic => bruteCosmetic.brute)
  bruteCosmetics: BruteCosmetic[];

  @OneToMany(() => Purchase, purchase => purchase.brute)
  purchases: Purchase[];

  @OneToMany(() => Battle, battle => battle.brute_attacker)
  battlesAsAttacker: Battle[];

  @OneToMany(() => Battle, battle => battle.brute_defender)
  battlesAsDefender: Battle[];
}
