import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0MWxvT...' })
  access_token: string;

  @ApiProperty({ example: 540 })
  expires_in: number;

  @ApiProperty({ example: 1800 })
  refresh_expires_in: number;

  @ApiProperty({ example: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyY2E2OW...' })
  refresh_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 0 })
  ['not-before-policy']: number;

  @ApiProperty({ example: 'b1c1ba13-41d3-4b33-b56b-f68e5eb5d4ee' })
  session_state: string;

  @ApiProperty({ example: 'email profile' })
  scope: string;
}
