// UserService for user management logic, moved from auth
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brute } from '../../entities/brute/brute.entity';
import { User } from '../../entities/user.entity';
import { BruteService } from './brute.service';

@Injectable()
export class UserService {
  private adminToken: string | null = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Brute) private bruteRepository: Repository<Brute>,
    private bruteService: BruteService,
  ) {}

  setAdminToken(token: string) {
    this.adminToken = token;
  }

  private getAdminToken(): string {
    if (!this.adminToken) {
      throw new BadRequestException('Admin token no disponible');
    }
    return this.adminToken;
  }

  // Métodos que requieren token de admin
  async getAllUsers() {
    const keycloak = this.configService.get('yamlConfig.keycloak');
    const url = `${keycloak.url}/admin/realms/${keycloak.realm}/users`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.getAdminToken()}` },
    });
    return response.data;
  }

  async getUserById(userId: string) {
    const keycloak = this.configService.get('yamlConfig.keycloak');
    const url = `${keycloak.url}/admin/realms/${keycloak.realm}/users/${userId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.getAdminToken()}` },
    });
    return response.data;
  }

  // Métodos que no requieren token de admin
  async getUserFromDb(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['brutes']
    });
  }

  async getAllBrutes() {
    return this.bruteRepository.find({
      relations: [
        'stats',
        'bruteSkills',
        'bruteSkills.skill',
        'bruteWeapons',
        'bruteWeapons.weapon',
        'user'
      ]
    });
  }

  async createBruteForUser(userId: string, name: string) {
    return this.bruteService.createBruteForUser(userId, name);
  }

  async selectBrute(userId: string, bruteId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const brute = await this.bruteRepository.findOne({ 
      where: { id: bruteId, user: { id: userId } },
      relations: ['user']
    });
    
    if (!brute) throw new BadRequestException('El bruto no pertenece al usuario');
    
    user.selected_brute_id = bruteId;
    await this.userRepository.save(user);
    return { message: 'Bruto seleccionado', selected_brute_id: bruteId };
  }

  async deleteBruteById(bruteId: number) {
    return this.bruteService.getBruteById(bruteId).then(brute => {
      if (!brute) throw new BadRequestException('Bruto no encontrado');
      return this.bruteService.deleteBrute(brute);
    });
  }

  async deleteAllBrutes() {
    return this.bruteService.deleteAllBrutes();
  }

  public getBruteService() {
    return this.bruteService;
  }
}