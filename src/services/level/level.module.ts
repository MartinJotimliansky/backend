import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelExperience } from '../../entities/battle/level_experience.entity';
import { Gratification } from '../../entities/battle/gratification.entity';
import { StatBoostPossibility } from '../../entities/battle/stat_boost_possibility.entity';
import { BruteLevelChoice } from '../../entities/brute/brute_level_choice.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Brute } from '../../entities/brute/brute.entity';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { BruteModule } from '../brute/brute.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LevelExperience, Gratification, StatBoostPossibility]),
    BruteModule
  ],
  controllers: [LevelController],
  providers: [LevelService],
  exports: [LevelService],
})
export class LevelModule {}
