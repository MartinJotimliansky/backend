import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Brute } from './brute/brute.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string; // UUID de Keycloak

  @Column({ unique: true })
  email: string;

  @Column({ default: 0 })
  premium_currency: number;

  // Puedes agregar más campos personalizados aquí

  @OneToMany(() => Brute, brute => brute.user)
  brutes: Brute[];

  @Column({ nullable: true })
  selected_brute_id: number;
}
