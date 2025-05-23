import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Brute } from '../brute/brute.entity';
import { ShopItem } from './shop_item.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute, brute => brute.purchases)
  brute: Brute;

  @ManyToOne(() => ShopItem)
  shopItem: ShopItem;
}
