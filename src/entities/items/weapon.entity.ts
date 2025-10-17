import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('weapons')
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

  @Column('int', { array: true, name: 'effect_ids', default: () => "'{}'" })
  effectIds: number[];

  @Column({ type: 'int', default: 0 })
  power_value: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}
