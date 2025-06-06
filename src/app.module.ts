import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './services/user/user.module';
import { BackofficeModule } from './services/backoffice/backoffice.module';
import { FightModule } from './services/fight/fight.module';
import { BruteModule } from './services/brute/brute.module';
import { LevelModule } from './services/level/level.module';
import yamlConfig from './config/global/environments/config/yamlConfig';
import { Action } from './entities/battle/action.entity';
import { Battle } from './entities/battle/battle.entity';
import { BattleLog } from './entities/battle/battle_log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [yamlConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get('yamlConfig.database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,          database: db.name,
          autoLoadEntities: true,
          synchronize: false,
          entities: [
            Action,
            Battle,
            BattleLog,
            __dirname + '/**/*.entity{.ts,.js}',
          ],
        };
      },
    }),    AuthModule,
    UserModule,
    BackofficeModule,
    FightModule,
    BruteModule,
    LevelModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
