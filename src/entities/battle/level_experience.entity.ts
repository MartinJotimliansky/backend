import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('level_experiences')
export class LevelExperience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'int' })
  experience: number;
}
