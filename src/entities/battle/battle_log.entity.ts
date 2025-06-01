import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Battle } from './battle.entity';

@Entity('battle_logs')
export class BattleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Battle, battle => battle.logs)
  @JoinColumn({ name: 'battleId' })
  battle: Battle;

  @Column({ type: 'int', name: 'turn_number' })
  turn_number: number;

  @Column({ type: 'varchar', name: 'action_type' })
  action_type: string;

  @Column({ type: 'varchar' })
  description: string;
}
