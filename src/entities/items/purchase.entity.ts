import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Brute } from '../brute/brute.entity';
import { ShopItem } from './shop_item.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute)
  @JoinColumn({ name: 'bruteId' })
  brute: Brute;

  @ManyToOne(() => ShopItem)
  @JoinColumn({ name: 'shopItemId' })
  shopItem: ShopItem;
}
