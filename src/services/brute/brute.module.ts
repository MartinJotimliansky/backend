import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BruteService } from './brute.service';
import { BruteJsonService } from './brute-json.service';
import { Brute } from '../../entities/brute/brute.entity';
import { User } from '../../entities/user.entity';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Weapon } from '../../entities/items/weapon.entity';
import { Skill } from '../../entities/items/skill.entity';
import { BruteController } from './brute.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brute,
      User,
      BrutoConfig,
      Stat,
      Weapon,
      Skill,
    ]),
  ],
  controllers: [BruteController],
  providers: [BruteService, BruteJsonService],
  exports: [BruteService, BruteJsonService],
})
export class BruteModule {}
