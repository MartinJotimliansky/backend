import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../entities/user.entity';
import { Brute } from '../../entities/brute/brute.entity';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Weapon } from '../../entities/items/weapon.entity';
import { Skill } from '../../entities/items/skill.entity';
import { BruteService } from '../brute/brute.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    User, Brute, BrutoConfig, Stat, Weapon, Skill
  ])],
  providers: [UserService, BruteService],
  controllers: [UserController],
  exports: [UserService, BruteService],
})
export class UserModule {}
