import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('gratifications')
export class Gratification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'int', name: 'min_level', default: 1 })
  min_level: number;

  @Column({ type: 'jsonb', name: 'value_json' })
  value_json: any;
}
