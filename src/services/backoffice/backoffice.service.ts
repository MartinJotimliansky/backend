import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';

@Injectable()
export class BackofficeService {
  constructor(
    @InjectRepository(BrutoConfig)
    private readonly brutoConfigRepo: Repository<BrutoConfig>,
  ) {}

  async getBrutoConfig(): Promise<BrutoConfig | null> {
    return this.brutoConfigRepo.findOne({ where: {} });
  }

  async updateBrutoConfig(dto: Partial<BrutoConfig>): Promise<BrutoConfig> {
    let config = await this.brutoConfigRepo.findOne({ where: {} });
    if (!config) {
      config = this.brutoConfigRepo.create(dto);
    } else {
      Object.assign(config, dto);
    }
    return this.brutoConfigRepo.save(config);
  }
}
