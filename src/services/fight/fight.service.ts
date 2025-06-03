import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FightRepository } from '../../repositories/fight.repository';
import { Battle } from '../../entities/battle/battle.entity';
import { BattleResultDto } from './dto/battle-result.dto';
import { BattleLogDto } from './dto/battle-log.dto';
import { BruteResponseDto } from '../user/dto/brute-response.dto';
import { StatCalculator } from '../../entities/battle/stat_calculator';
import { Action, ActionType } from '../../entities/battle/action.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brute } from '../../entities/brute/brute.entity';
import { User } from '../../entities/user.entity';

interface BattleLogEntry {
    turn: number;
    playerTurn: number;
    action: string;
    damage?: number;
    healAmount?: number;
    attackerHp: number;
    defenderHp: number;
}

interface CombatState {
    attackerCurrentHp: number;
    defenderCurrentHp: number;
    turn: number;
    logs: BattleLogEntry[];
}

@Injectable()
export class FightService {
    private readonly logger = new Logger(FightService.name);

    constructor(
        private readonly fightRepository: FightRepository,
        @InjectRepository(Brute) private readonly bruteRepository: Repository<Brute>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Action) private readonly actionRepository: Repository<Action>
    ) {}

    private mapBruteToBruteResponse(brute: any): BruteResponseDto {
        return {
            id: brute.id,
            name: brute.name,
            level: brute.level,
            xp: brute.xp,
            gold: brute.gold,
            stats: brute.stats?.[0] ?? null,
            skills: brute.bruteSkills?.map(bs => bs.skill) ?? [],
            weapons: brute.bruteWeapons?.map(bw => bw.weapon) ?? [],
            isSelected: false
        };
    }

    private mapBattleLogToBattleLogDto(log: BattleLogEntry): BattleLogDto {
        return {
            turn: log.turn,
            playerTurn: log.playerTurn,
            action: log.action,
            damage: log.damage ?? 0,  // convertir undefined a 0
            healAmount: log.healAmount ?? 0,  // convertir undefined a 0
            attackerHp: log.attackerHp,
            defenderHp: log.defenderHp
        };
    }

    private mapBattleToBattleResult(battle: Battle): BattleResultDto {
        const logs = battle.logs?.logs ?? [];
        return {
            id: battle.id,
            attacker: this.mapBruteToBruteResponse(battle.bruteAttacker),
            defender: this.mapBruteToBruteResponse(battle.bruteDefender),
            winner: this.mapBruteToBruteResponse(battle.winnerBrute),
            battleLogs: logs.map(log => this.mapBattleLogToBattleLogDto(log))
        };
    }

    async startBattleWithSelectedBrute(userId: string, opponentId: number): Promise<BattleResultDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user || !user.selected_brute_id) {
            throw new BadRequestException('No tienes un bruto seleccionado');
        }

        const [attacker, defender] = await Promise.all([
            this.bruteRepository.findOne({
                where: { id: user.selected_brute_id },
                relations: ['stats', 'bruteSkills', 'bruteSkills.skill', 'bruteWeapons', 'bruteWeapons.weapon', 'user']
            }),
            this.bruteRepository.findOne({
                where: { id: opponentId },
                relations: ['stats', 'bruteSkills', 'bruteSkills.skill', 'bruteWeapons', 'bruteWeapons.weapon', 'user']
            })
        ]);

        if (!attacker || !defender) {
            throw new BadRequestException('Uno de los brutos no existe');
        }

        if (attacker.user.id === defender.user.id) {
            throw new BadRequestException('No puedes luchar contra tu propio bruto');
        }

        const battleResult = await this.executeBattle(attacker, defender);
        return this.mapBattleToBattleResult(battleResult);
    }

    private async addBattleLogEntry(
        state: CombatState,
        playerTurn: number,
        actionType: ActionType,
        damage: number = 0,
        healAmount: number = 0
    ) {
        const action = await this.actionRepository.findOne({
            where: { type: actionType }
        });

        if (!action) {
            throw new Error(`Action type ${actionType} not found`);
        }

        state.logs.push({
            turn: state.turn,
            playerTurn,
            action: action.name,
            damage: damage || undefined,
            healAmount: healAmount || undefined,
            attackerHp: state.attackerCurrentHp,
            defenderHp: state.defenderCurrentHp
        });
    }

    private async executeBattle(attacker: Brute, defender: Brute): Promise<Battle> {
        this.logger.debug(`Iniciando batalla entre ${attacker.name} y ${defender.name}`);
        
        // Initialize battle state
        const attackerStats = attacker.stats[0];
        const defenderStats = defender.stats[0];
        const attackerMaxHp = StatCalculator.calculateMaxHp(attackerStats.hp, attackerStats);
        const defenderMaxHp = StatCalculator.calculateMaxHp(defenderStats.hp, defenderStats);
        
        const state: CombatState = {
            attackerCurrentHp: attackerMaxHp,
            defenderCurrentHp: defenderMaxHp,
            turn: 1,
            logs: []
        };

        // Create battle
        const battle = await this.fightRepository.createBattle({
            bruteAttackerId: attacker.id,
            bruteDefenderId: defender.id,
            seed: Math.random().toString(36).substring(7)
        });

        // Execute battle turns until someone dies
        while (state.attackerCurrentHp > 0 && state.defenderCurrentHp > 0) {
            const isAttackerTurn = state.turn % 2 === 1;
            const currentAttacker = isAttackerTurn ? attacker : defender;
            const currentDefender = isAttackerTurn ? defender : attacker;
            const attackerTurnStats = isAttackerTurn ? attackerStats : defenderStats;
            const defenderTurnStats = isAttackerTurn ? defenderStats : attackerStats;
            const playerTurn = isAttackerTurn ? 1 : 2;

            // Check for dodge
            if (StatCalculator.checkDodge(defenderTurnStats)) {
                await this.addBattleLogEntry(state, playerTurn, ActionType.DODGE);
                state.turn++;
                continue;
            }

            // Calculate base damage (using weapon if available)
            let baseDamage = 5; // Base unarmed damage
            let actionType = ActionType.BASIC_ATTACK;
            if (currentAttacker.bruteWeapons && currentAttacker.bruteWeapons.length > 0) {
                const weapon = currentAttacker.bruteWeapons[0].weapon;
                baseDamage = weapon.min_damage + Math.floor(Math.random() * (weapon.max_damage - weapon.min_damage + 1));
                actionType = ActionType.WEAPON_ATTACK;
            }

            // Apply stat modifiers to damage
            let damage = StatCalculator.calculateFinalDamage(
                baseDamage,
                attackerTurnStats,
                defenderTurnStats
            );

            // Check for block
            if (StatCalculator.checkBlock(defenderTurnStats)) {
                damage = Math.floor(damage * 0.5);
            }

            // Apply damage
            if (isAttackerTurn) {
                state.defenderCurrentHp = Math.max(0, state.defenderCurrentHp - damage);
            } else {
                state.attackerCurrentHp = Math.max(0, state.attackerCurrentHp - damage);
            }

            // Log the attack
            await this.addBattleLogEntry(state, playerTurn, actionType, damage);

            // Check for combo
            if (StatCalculator.checkCombo(attackerTurnStats)) {
                const comboDamage = Math.floor(damage * 0.5);
                if (isAttackerTurn) {
                    state.defenderCurrentHp = Math.max(0, state.defenderCurrentHp - comboDamage);
                } else {
                    state.attackerCurrentHp = Math.max(0, state.attackerCurrentHp - comboDamage);
                }

                await this.addBattleLogEntry(state, playerTurn, ActionType.COMBO, comboDamage);
            }

            // Check for counter
            if (state.attackerCurrentHp > 0 && state.defenderCurrentHp > 0 && 
                StatCalculator.checkCounter(defenderTurnStats)) {
                const counterDamage = Math.floor(damage * 0.7);
                if (isAttackerTurn) {
                    state.attackerCurrentHp = Math.max(0, state.attackerCurrentHp - counterDamage);
                } else {
                    state.defenderCurrentHp = Math.max(0, state.defenderCurrentHp - counterDamage);
                }

                await this.addBattleLogEntry(state, isAttackerTurn ? 2 : 1, ActionType.COUNTER, counterDamage);
            }

            // Don't check for double turn if someone died
            if (state.attackerCurrentHp > 0 && state.defenderCurrentHp > 0 && 
                StatCalculator.checkDoubleTurn(attackerTurnStats)) {
                // Skip turn increment to allow another action
                await this.addBattleLogEntry(state, playerTurn, ActionType.BASIC_ATTACK);
            } else {
                state.turn++;
            }
        }

        try {
            // Determine winner and update experience
            const isAttackerWinner = state.defenderCurrentHp <= 0;
            const winner = isAttackerWinner ? attacker : defender;
            const loser = isAttackerWinner ? defender : attacker;
            
            // Update XP for winner (2 XP) and loser (1 XP)
            winner.xp += 2;
            loser.xp += 1;

            // Save updated XP for both brutes
            await Promise.all([
                this.bruteRepository.save(winner),
                this.bruteRepository.save(loser)
            ]);

            // Save battle log
            await this.fightRepository.createBattleLog({
                battle,
                logs: state.logs
            });

            // Update battle with winner
            await this.fightRepository.updateBattle(battle.id, {
                winnerBruteId: winner.id
            });

            // Get the updated battle with all relations
            const completeBattle = await this.fightRepository.findBattleById(battle.id);
            if (!completeBattle) {
                throw new Error('Error al procesar la batalla');
            }

            return completeBattle;
        } catch (error) {
            this.logger.error('Error al actualizar la experiencia o finalizar la batalla', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getBattleHistory(bruteId: number): Promise<BattleResultDto[]> {
        const battles = await this.fightRepository.findBattlesByBruteId(bruteId);
        return battles.map(battle => this.mapBattleToBattleResult(battle));
    }
}
