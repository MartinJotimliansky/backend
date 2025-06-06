import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('level_experiences')
export class LevelExperience {
  @PrimaryColumn({ type: 'int' })
  level: number;

  @Column({ type: 'int' })
  experience: number;
}
