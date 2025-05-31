import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('weapon')
export class Weapon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int' })
  min_damage: number;

  @Column({ type: 'int' })
  max_damage: number;

  @Column({ type: 'int', default: 10 })
  crit_chance: number;

  @Column({ type: 'int', default: 1 })
  range: number;

  @Column({ type: 'int', default: 100 })
  draw_chance: number;

  @Column({ type: 'int', default: 100 })
  hit_chance: number;

  @Column({ type: 'int', default: 100 })
  speed: number;

  @Column('int', { array: true, default: () => "'{}'" })
  effect_ids: number[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
