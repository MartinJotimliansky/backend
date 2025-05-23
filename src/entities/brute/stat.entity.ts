import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Brute } from './brute.entity';

@Entity('stats')
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute, brute => brute.stats)
  brute: Brute;

  @Column({ default: 0 })
  strength: number;

  @Column({ default: 0 })
  agility: number;

  @Column({ default: 0 })
  defense: number;

  @Column({ default: 0 })
  luck: number;

  @Column({ name: 'available_points', default: 0 })
  availablePoints: number;
}
