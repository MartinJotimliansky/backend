import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stat_boost_possibilities')
export class StatBoostPossibility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  hp: number;

  @Column({ type: 'int', default: 0 })
  strength: number;

  @Column({ type: 'int', default: 0 })
  resistance: number;

  @Column({ type: 'int', default: 0 })
  speed: number;

  @Column({ type: 'int', default: 0 })
  intelligence: number;

  @Column({ type: 'int' })
  min_level: number;
}
