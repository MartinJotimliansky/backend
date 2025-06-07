import { IsNumber, IsObject, IsString, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GratificationChoiceDto {
  @ApiProperty({
    description: 'ID de la gratificación en formato tipo_id',
    example: 'stat_boost_1'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Tipo de gratificación',
    enum: ['stat_boost', 'weapon', 'skill']
  })
  @IsString()
  @IsIn(['stat_boost', 'weapon', 'skill'])
  type: 'stat_boost' | 'weapon' | 'skill';
}

export class LevelUpRequestDto {
  @ApiProperty({
    description: 'ID del bruto que va a subir de nivel',
    example: 1
  })
  @IsNumber()
  bruteId: number;

  @ApiProperty({
    description: 'Gratificación elegida por el jugador',
    type: GratificationChoiceDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => GratificationChoiceDto)
  gratificationChoice: GratificationChoiceDto;
}
