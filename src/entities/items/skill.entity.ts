import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { array: true, name: 'activation_triggers', nullable: true })
  activationTriggers: string[];

  @Column({ type: 'jsonb', name: 'effect_json', nullable: true })
  effectJson: any;
}
