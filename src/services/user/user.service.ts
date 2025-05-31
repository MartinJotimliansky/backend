// UserService for user management logic, moved from auth
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brute } from '../../entities/brute/brute.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Brute) private bruteRepository: Repository<Brute>,
  ) {}

  async getAllUsers(adminToken: string) {
    const keycloak = this.configService.get('yamlConfig.keycloak');
    const url = `${keycloak.url}/admin/realms/${keycloak.realm}/users`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response.data;
  }

  async getUserById(userId: string, adminToken: string) {
    // Obtiene datos de Keycloak
    const keycloak = this.configService.get('yamlConfig.keycloak');
    const url = `${keycloak.url}/admin/realms/${keycloak.realm}/users/${userId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    // Obtiene datos locales
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['brutes'] });
    let selectedBrute: any = null;
    if (user && user.selected_brute_id) {
      selectedBrute = user.brutes.find(b => b.id === user.selected_brute_id) || null;
    }
    // Combina datos de Keycloak y locales
    return {
      ...response.data,
      selectedBrute: selectedBrute ?? null,
    };
  }

  async createBruteForUser(userId: string, name: string) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['brutes'] });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    console.log(user);
    if (user.brutes && user.brutes.length >= 5) throw new BadRequestException('Máximo 5 brutos por usuario');
    const brute = this.bruteRepository.create({ name, user });
    await this.bruteRepository.save(brute);
    return brute;
  }

  async selectBrute(userId: string, bruteId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    // Busca el bruto por id y userId directamente en la base de datos
    const brute = await this.bruteRepository.findOne({ where: { id: bruteId, user: { id: userId } } });
    if (!brute) throw new BadRequestException('El bruto no pertenece al usuario');
    user.selected_brute_id = bruteId;
    await this.userRepository.save(user);
    return { message: 'Bruto seleccionado', selected_brute_id: bruteId };
  }
}
