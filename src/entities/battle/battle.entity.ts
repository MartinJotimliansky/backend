import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { Brute } from '../brute/brute.entity';
import { BattleLog } from './battle_log.entity';

@Entity('battles')
export class Battle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute)
  brute_attacker: Brute;

  @ManyToOne(() => Brute)
  brute_defender: Brute;

  @ManyToOne(() => Brute)
  winner_brute: Brute;

  @Column()
  seed: string;

  @OneToMany(() => BattleLog, log => log.battle)
  logs: BattleLog[];
}
