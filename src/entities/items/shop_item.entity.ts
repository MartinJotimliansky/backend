import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shop_items')
export class ShopItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'item_type' })
  item_type: string;

  @Column({ type: 'int', name: 'reference_id' })
  reference_id: number;

  @Column({ type: 'int', name: 'price_gold', nullable: true })
  price_gold: number;

  @Column({ type: 'int', name: 'price_premium', nullable: true })
  price_premium: number;
}
