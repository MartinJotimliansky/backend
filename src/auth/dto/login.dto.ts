import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  username: string;

  @ApiProperty({ example: 'tu_contraseña' })
  password: string;
}
