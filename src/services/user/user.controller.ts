import { Controller, Get, Param, Req, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';
import { KeycloakAdminAuthGuard } from '../../auth/guards/keycloak-admin-auth.guard';
import { KeycloakLoginAuthGuard } from '../../auth/guards/keycloak-login-auth.guard';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('Bearer')
@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(KeycloakAdminAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Get all users', description: 'Returns a list of all users from Keycloak.' })
    @ApiOkResponse({ type: [UserResponseDto], description: 'List of users.' })
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get(':userId')
    @UseGuards(KeycloakLoginAuthGuard)
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Get user by ID', description: 'Returns a user from the database.' })
    @ApiOkResponse({ type: UserResponseDto, description: 'User details.' })
    async getUserById(@Param('userId') userId: string, @Req() req: Request) {
        const user = await this.userService.getUserFromDb(userId);
        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        return {
            id: user.id,
            email: user.email,
            premium_currency: user.premium_currency,
            selected_brute_id: user.selected_brute_id
        };
    }
}
