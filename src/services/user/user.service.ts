// UserService for user management logic, moved from auth
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brute } from '../../entities/brute/brute.entity';
import { User } from '../../entities/user.entity';
import { BrutoConfig } from '../../entities/brute/bruto_config.entity';
import { Stat } from '../../entities/brute/stat.entity';
import { Weapon } from '../../entities/items/weapon.entity';
import { Ability } from '../../entities/items/ability.entity';
import { BruteService } from './brute.service';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Brute) private bruteRepository: Repository<Brute>,
    private bruteService: BruteService,
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

  async createBruteForUser(userId: string, name: string) {
    return this.bruteService.createBruteForUser(userId, name);
  }

  async getAllBrutes() {
    return this.bruteRepository.find({
      relations: [
        'stats',
        'bruteSkills',
        'bruteSkills.skill',
        'bruteWeapons',
        'bruteWeapons.weapon',
        'bruteCosmetics',
        'bruteCosmetics.cosmetic',
        'user'
      ]
    });
  }

  async deleteBruteById(bruteId: number) {
    // Borra todas las relaciones dependientes primero (en orden seguro)
    await this.bruteRepository.manager.transaction(async manager => {
      await manager.delete('brute_level_choices', { brute: bruteId });
      await manager.delete('brute_skills', { brute: bruteId });
      await manager.delete('brute_weapons', { brute: bruteId });
      await manager.delete('brute_cosmetics', { brute: bruteId });
      await manager.delete('purchases', { brute: bruteId });
      await manager.delete('stats', { brute: bruteId });
      await manager.delete('brutes', { id: bruteId });
    });
  }

  async deleteAllBrutes() {
    // Borra todas las relaciones dependientes primero (en orden seguro)
    await this.bruteRepository.manager.transaction(async manager => {
      await manager.query('DELETE FROM brute_level_choices');
      await manager.query('DELETE FROM brute_skills');
      await manager.query('DELETE FROM brute_weapons');
      await manager.query('DELETE FROM brute_cosmetics');
      await manager.query('DELETE FROM purchases');
      await manager.query('DELETE FROM stats');
      await manager.query('DELETE FROM brutes');
    });
  }

  // Exponer el servicio de brutos para el controlador
  public getBruteService() {
    return this.bruteService;
  }
}
