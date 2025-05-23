import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('level_experience')
export class LevelExperience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column()
  experience: number;
}
