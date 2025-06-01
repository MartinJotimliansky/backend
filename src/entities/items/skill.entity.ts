import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  name: string;

  @Column('text', { array: true, name: 'activation_triggers', nullable: true })
  activationTriggers: string[];

  @Column({ type: 'jsonb', name: 'effect_json', nullable: true })
  effectJson: any;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_passive: boolean;

  @Column({ type: 'int', default: 0, nullable: true })
  power_value: number;
}
