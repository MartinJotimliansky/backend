import { ApiProperty } from '@nestjs/swagger';

export class GratificationOptionDto {
  @ApiProperty({ description: 'ID único de la opción' })
  id: string;

  @ApiProperty({ 
    description: 'Tipo de gratificación',
    enum: ['stat_boost', 'weapon', 'skill']
  })
  type: 'stat_boost' | 'weapon' | 'skill';

  @ApiProperty({ description: 'Nombre de la gratificación' })
  name: string;

  @ApiProperty({ description: 'Descripción de la gratificación' })
  description: string;

  @ApiProperty({ description: 'Datos específicos de la gratificación' })
  data: any;
}
