import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Cosmetic } from '../items/cosmetic.entity';
import { Brute } from './brute.entity';

@Entity('brute_cosmetics')
export class BruteCosmetic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute, brute => brute.bruteCosmetics)
  brute: Brute;

  @ManyToOne(() => Cosmetic)
  cosmetic: Cosmetic;

  @Column({ default: false })
  equipped: boolean;
}
