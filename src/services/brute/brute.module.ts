import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BruteService } from './brute.service';
import { Brute } from '../../entities/brute/brute.entity';
import { User } from '../../entities/user.entity';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Weapon } from '../../entities/items/weapon.entity';
import { Skill } from '../../entities/items/skill.entity';
import { BruteWeapon } from '../../entities/brute/brute_weapon.entity';
import { BruteSkill } from '../../entities/brute/brute_skill.entity';
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
      BruteWeapon,
      BruteSkill,
    ]),
  ],
  controllers: [BruteController],
  providers: [BruteService],
  exports: [BruteService],
})
export class BruteModule {}
