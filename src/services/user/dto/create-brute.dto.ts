import { ApiProperty } from '@nestjs/swagger';

export class CreateBruteDto {
  @ApiProperty({ example: 'MiBruto' })
  name: string;
}
