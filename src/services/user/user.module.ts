import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../entities/user.entity';
import { Brute } from '../../entities/brute/brute.entity';
import { BruteService } from './brute.service';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Weapon } from '../../entities/items/weapon.entity';
import { Skill } from '../../entities/items/skill.entity';
import { BruteWeapon } from '../../entities/brute/brute_weapon.entity';
import { BruteSkill } from '../../entities/brute/brute_skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    User, Brute, BrutoConfig, Stat, Weapon, Skill, BruteWeapon, BruteSkill
  ])],
  providers: [UserService, BruteService],
  controllers: [UserController],
  exports: [UserService, BruteService],
})
export class UserModule {}
