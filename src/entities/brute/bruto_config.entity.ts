import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bruto_config')
export class BrutoConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  min_total_power_points: number;

  @Column({ type: 'int' })
  max_total_power_points: number;

  @Column({ type: 'int' })
  min_stat_points: number;

  @Column({ type: 'int' })
  max_stat_points: number;

  @CreateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
}
