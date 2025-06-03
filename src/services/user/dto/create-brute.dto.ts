import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateBruteDto {
  @ApiProperty({ 
    example: 'MiBruto',
    description: 'Nombre del bruto. Solo letras, números y guiones. Entre 3 y 20 caracteres.',
    minLength: 3,
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El nombre no puede tener más de 20 caracteres' })
  @Matches(/^[a-zA-Z0-9-_]+$/, { 
    message: 'El nombre solo puede contener letras, números y guiones' 
  })
  name: string;
}
