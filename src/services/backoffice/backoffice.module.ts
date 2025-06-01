import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';

@Module({
  imports: [TypeOrmModule.forFeature([BrutoConfig])],
  controllers: [BackofficeController],
  providers: [BackofficeService],
})
export class BackofficeModule {}
