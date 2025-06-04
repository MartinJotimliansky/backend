// UserService for user management logic, moved from auth
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ) {}

    async getAllUsers() {
        return await this.userRepository.find();
    }

    async getUserFromDb(userId: string) {
        return await this.userRepository.findOne({ where: { id: userId } });
    }
}