import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'nueva_contraseña', description: 'Nueva contraseña' })
  newPassword: string;
}
