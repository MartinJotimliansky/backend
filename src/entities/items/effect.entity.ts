import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('effects')
export class Effect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'int', default: 100, nullable: true })
  accuracy: number;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_passive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
