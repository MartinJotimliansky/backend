import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('gratifications')
export class Gratification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: 'stat_boost' | 'skill' | 'passive';

  @Column({ name: 'min_level', default: 1 })
  minLevel: number;

  @Column({ type: 'jsonb', name: 'value_json' })
  valueJson: any;
}
