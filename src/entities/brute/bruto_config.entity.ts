import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('backoffice_brutes')
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

  @Column({ type: 'int' })
  min_health_points: number;

  @Column({ type: 'int' })
  max_health_points: number;
  @Column({ type: 'int', default: 50 })
  base_hp: number;

  @Column({ type: 'int', default: 50 })
  weapon_chance: number; // Probabilidad (0-100) de que salga arma en vez de habilidad
  @Column({ type: 'int', default: 5 })
  max_brutes: number; // Número máximo de brutos por usuario

  @Column({ type: 'int', default: 50 })
  max_lvl: number; // Nivel máximo que pueden alcanzar los brutos

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
