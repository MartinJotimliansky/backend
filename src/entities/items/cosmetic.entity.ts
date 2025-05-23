import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cosmetics')
export class Cosmetic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ name: 'price_premium', nullable: true })
  pricePremium: number;
}
