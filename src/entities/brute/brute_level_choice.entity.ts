import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Gratification } from '../battle/gratification.entity';
import { Brute } from './brute.entity';

@Entity('brute_level_choices')
export class BruteLevelChoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute, brute => brute.levelChoices)
  brute: Brute;

  @Column()
  level: number;

  @ManyToOne(() => Gratification)
  gratification: Gratification;
}
