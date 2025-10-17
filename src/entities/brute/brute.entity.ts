import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Stat } from './stat.entity';
import { BruteLevelChoice } from './brute_level_choice.entity';
import { BruteCosmetic } from './brute_cosmetic.entity';
import { Purchase } from '../items/purchase.entity';
import { User } from '../user.entity';

@Entity('brutes')
export class Brute {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @ManyToOne(() => User, user => user.brutes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Stat, stat => stat.brute)
  stats: Stat[];

  @OneToMany(() => BruteLevelChoice, choice => choice.brute)
  levelChoices: BruteLevelChoice[];

  // Campos JSON para skills y weapons (nuevo diseño)
  @Column({ type: 'json', nullable: true, default: '[]' })
  skill_ids: number[];

  @Column({ type: 'json', nullable: true, default: '[]' })
  weapon_ids: number[];

  @Column({ type: 'json', nullable: true, default: '{}' })
  skill_config: Record<string, any>; // Para triggers y otras configuraciones

  @Column({ type: 'json', nullable: true, default: '{}' })
  weapon_config: Record<string, any>; // Para equipped y otras configuraciones

  @OneToMany(() => BruteCosmetic, bruteCosmetic => bruteCosmetic.brute)
  bruteCosmetics: BruteCosmetic[];

  @OneToMany(() => Purchase, purchase => purchase.brute)
  purchases: Purchase[];
}
