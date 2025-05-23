import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Brute } from './brute/brute.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 0 })
  premium_currency: number;

  @OneToMany(() => Brute, brute => brute.user)
  brutes: Brute[];
}