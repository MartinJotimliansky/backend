import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cosmetics')
export class Cosmetic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'int', name: 'price_premium', nullable: true })
  price_premium: number;
}
