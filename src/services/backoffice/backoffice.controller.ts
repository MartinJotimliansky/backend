import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BackofficeService } from './backoffice.service';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { KeycloakAdminAuthGuard } from '../../auth/guards/keycloak-admin-auth.guard';
import { BrutoConfigDto } from './dto/bruto-config.dto';

@ApiTags('Backoffice')
@ApiBearerAuth('Bearer')
@Controller('backoffice/config')
@UseGuards(KeycloakAdminAuthGuard)
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('bruto')
  @ApiOkResponse({ type: BrutoConfigDto })
  async getBrutoConfig(): Promise<BrutoConfigDto | null> {
    return this.backofficeService.getBrutoConfig();
  }

  @Put('bruto')
  @ApiOkResponse({ type: BrutoConfigDto })
  @ApiBody({ type: BrutoConfigDto })
  async updateBrutoConfig(
    @Body() dto: BrutoConfigDto,
  ): Promise<BrutoConfigDto> {
    console.log('Updating BrutoConfig with:', dto);
    return this.backofficeService.updateBrutoConfig(dto);
  }
}
