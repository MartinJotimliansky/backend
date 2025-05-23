import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Battle } from './battle.entity';

@Entity('battle_logs')
export class BattleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Battle, battle => battle.logs)
  battle: Battle;

  @Column({ name: 'turn_number' })
  turnNumber: number;

  @Column({ name: 'action_type' })
  actionType: string;

  @Column()
  description: string;
}
