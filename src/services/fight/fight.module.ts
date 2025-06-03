import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FightController } from './fight.controller';
import { FightService } from './fight.service';
import { FightRepository } from '../../repositories/fight.repository';
import { BruteRepository } from '../../repositories/brute.repository';
import { Battle } from '../../entities/battle/battle.entity';
import { BattleLog } from '../../entities/battle/battle_log.entity';
import { Action } from '../../entities/battle/action.entity';
import { Brute } from '../../entities/brute/brute.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { BruteSkill } from '../../entities/brute/brute_skill.entity';
import { BruteWeapon } from '../../entities/brute/brute_weapon.entity';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Battle,
      BattleLog,
      Action,
      Brute,
      Stat,
      BruteSkill,
      BruteWeapon,
      BrutoConfig,
      User
    ]),
  ],
  controllers: [FightController],
  providers: [
    FightService,
    FightRepository,
    BruteRepository
  ],
  exports: [FightService],
})
export class FightModule {}
