import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shop_items')
export class ShopItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_type' })
  itemType: 'weapon' | 'cosmetic' | 'stat_boost' | 'skill';

  @Column({ name: 'reference_id' })
  referenceId: number;

  @Column({ name: 'price_gold', nullable: true })
  priceGold: number;

  @Column({ name: 'price_premium', nullable: true })
  pricePremium: number;
}
