import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'd729e769-9b9a-42ef-8a25-8d66c1d3039b' })
  id: string;

  @ApiProperty({ example: 'gordo' })
  username: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: false })
  emailVerified: boolean;

  @ApiProperty({ example: 1748101611877 })
  createdTimestamp: number;

  @ApiProperty({ example: true })
  enabled: boolean;

  @ApiProperty({ example: false })
  totp: boolean;

  @ApiProperty({ example: [] })
  disableableCredentialTypes: string[];

  @ApiProperty({ example: [] })
  requiredActions: string[];

  @ApiProperty({ example: [] })
  federatedIdentities: any[];

  @ApiProperty({ example: 0 })
  notBefore: number;

  @ApiProperty({
    example: {
      manageGroupMembership: true,
      view: true,
      mapRoles: true,
      impersonate: true,
      manage: true,
    },
  })
  access: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };

  @ApiProperty({
    example: {
      id: 1,
      name: 'MiBruto',
      level: 1,
      xp: 0,
      gold: 0,
      // ...otros campos del bruto...
    },
    nullable: true,
    description: 'Bruto actualmente seleccionado por el usuario.',
  })
  selectedBrute: any;
}
