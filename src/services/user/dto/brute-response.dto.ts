import { ApiProperty } from '@nestjs/swagger';

export class BruteResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  level: number;

  @ApiProperty()
  xp: number;

  @ApiProperty()
  gold: number;

  @ApiProperty({ type: 'object', additionalProperties: true })
  stats: any;

  @ApiProperty({ type: 'array', items: { type: 'object' }, nullable: true })
  skills: any[] | null;

  @ApiProperty({ type: 'array', items: { type: 'object' }, nullable: true })
  weapons: any[] | null;
}
