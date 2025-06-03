import { Entity, PrimaryGeneratedColumn, OneToOne, Column, JoinColumn } from 'typeorm';
import { Battle } from './battle.entity';

interface BattleLogEntry {
  turn: number;
  playerTurn: number;
  action: string;
  damage?: number;
  healAmount?: number;
  attackerHp: number;
  defenderHp: number;
}

@Entity('battle_logs')
export class BattleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Battle)
  @JoinColumn({ name: 'battle_id' })
  battle: Battle;

  @Column({ type: 'jsonb' })
  logs: BattleLogEntry[];
}
