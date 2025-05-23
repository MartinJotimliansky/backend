import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Weapon } from '../items/weapon.entity';
import { Brute } from './brute.entity';

@Entity('brute_weapons')
export class BruteWeapon {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brute, brute => brute.bruteWeapons)
  brute: Brute;

  @ManyToOne(() => Weapon)
  weapon: Weapon;

  @Column({ default: false })
  equipped: boolean;
}
