import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Brute } from '../brute/brute.entity';
import { BattleLog } from './battle_log.entity';

@Entity('battles')
export class Battle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    seed: string;

    @Column({ name: 'bruteAttackerId' })
    bruteAttackerId: number;

    @Column({ name: 'bruteDefenderId' })
    bruteDefenderId: number;

    @Column({ name: 'winnerBruteId', nullable: true })
    winnerBruteId: number;

    @ManyToOne(() => Brute)
    @JoinColumn({ name: 'bruteAttackerId' })
    bruteAttacker: Brute;

    @ManyToOne(() => Brute)
    @JoinColumn({ name: 'bruteDefenderId' })
    bruteDefender: Brute;

    @ManyToOne(() => Brute)
    @JoinColumn({ name: 'winnerBruteId' })
    winnerBrute: Brute;

    @OneToOne(() => BattleLog, log => log.battle)
    logs: BattleLog;
}
