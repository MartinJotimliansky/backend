import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import yamlConfig from './config/yamlConfig';

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
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: true, // Cambia a false en producción
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
