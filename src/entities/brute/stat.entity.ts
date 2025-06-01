import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Brute } from './brute.entity';

@Entity('stats')
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'available_points', default: 0 })
  available_points: number;

  @Column({ type: 'int', default: 1 })
  strenght: number;

  @Column({ type: 'int', default: 1 })
  agility: number;

  @Column({ type: 'int', default: 1 })
  endurance: number;

  @Column({ type: 'int', default: 1 })
  intelligence: number;

  @Column({ type: 'int', default: 50 })
  hp: number;

  @ManyToOne(() => Brute)
  @JoinColumn({ name: 'brute_id' })
  brute: Brute;
}
