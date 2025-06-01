import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Skill } from '../items/skill.entity';
import { Brute } from './brute.entity';

@Entity('brute_skills')
export class BruteSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute, brute => brute.bruteSkills)
  brute: Brute;

  @ManyToOne(() => Skill, { nullable: false })
  skill: Skill;

  @Column({ name: 'selected_trigger', type: 'text', nullable: true })
  selectedTrigger: string | null;
}
