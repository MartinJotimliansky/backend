import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Brute } from '../entities/brute/brute.entity';
import { Stat } from '../entities/brute/stat.entity';
import { BruteLevelChoice } from '../entities/brute/brute_level_choice.entity';
import { BruteSkill } from '../entities/brute/brute_skill.entity';
import { BruteWeapon } from '../entities/brute/brute_weapon.entity';
import { BruteCosmetic } from '../entities/brute/brute_cosmetic.entity';
import { Purchase } from '../entities/items/purchase.entity';
import { ShopItem } from '../entities/items/shop_item.entity';
import { Skill } from '../entities/items/skill.entity';
import { Weapon } from '../entities/items/weapon.entity';
import { Cosmetic } from '../entities/items/cosmetic.entity';
import { Battle } from '../entities/battle/battle.entity';
import { BattleLog } from '../entities/battle/battle_log.entity';
import { Action } from '../entities/battle/action.entity';
import { Gratification } from '../entities/battle/gratification.entity';
import { LevelExperience } from '../entities/battle/level_experience.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User, Brute, Stat, BruteLevelChoice, BruteSkill, BruteWeapon, BruteCosmetic,
      Purchase, ShopItem, Skill, Weapon, Cosmetic, Battle, BattleLog, Action,
      Gratification, LevelExperience
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
