import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brute } from '../../entities/brute/brute.entity';
import { Battle } from '../../entities/battle/battle.entity';
import { BattleLog } from '../../entities/battle/battle_log.entity';
import { BruteService } from '../user/brute.service';
import { FightController } from './fight.controller';
import { FightService } from './fight.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brute,
      Battle,
      BattleLog
    ]),
  ],
  controllers: [FightController],
  providers: [FightService, BruteService],
  exports: [FightService],
})
export class FightModule {}
