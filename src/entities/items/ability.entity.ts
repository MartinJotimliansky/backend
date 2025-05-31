import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ability')
export class Ability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'boolean', default: false })
  is_passive: boolean;

  @Column({ type: 'text', nullable: true })
  activation: string | null;

  @Column('int', { array: true, default: () => "'{}'" })
  effect_ids: number[];

  @Column({ type: 'int', default: 0 })
  base_damage: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
