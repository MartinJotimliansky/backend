import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column('text', { array: true, name: 'activation_triggers', nullable: true })
  activationTriggers: string[];

  @Column('int', { array: true, name: 'effect_ids', default: () => "'{}'" })
  effectIds: number[];

  @Column({ type: 'boolean', default: false, nullable: true })
  is_passive: boolean;

  @Column({ type: 'int', default: 0, nullable: true })
  power_value: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}
