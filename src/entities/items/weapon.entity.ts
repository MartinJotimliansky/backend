import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('weapons')
export class Weapon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'damage_range_min', nullable: true })
  damageRangeMin: number;

  @Column({ name: 'damage_range_max', nullable: true })
  damageRangeMax: number;
}
