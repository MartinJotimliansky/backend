import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class BrutoConfigDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  min_total_power_points: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  max_total_power_points: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  min_stat_points: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  max_stat_points: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  min_health_points: number;
  @ApiProperty()
  @IsInt()
  @Min(0)
  max_health_points: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  max_lvl: number;
}
