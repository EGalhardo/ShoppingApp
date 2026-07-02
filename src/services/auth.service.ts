import { UserEntity } from '../types';
import { userRepository } from '../lib/repositories';

/**
 * Serviço de Autenticação/Utilizador: Gere a identidade offline.
 */
export const AuthService = {
  /**
   * Simula um registo/login local salvando no IndexedDB.
   */
  async registerUser(empresaId: string, data: Omit<UserEntity, keyof import('../types').BaseOfflineEntity>): Promise<string> {
    const existing = await userRepository.getByEmail(empresaId, data.email);
    if (existing) {
      return existing.id; // Retorna ID se já existe (simulando login)
    }

    return userRepository.create(data, empresaId);
  },

  /**
   * Obtém perfil completo.
   */
  async getProfile(userId: string): Promise<UserEntity | undefined> {
    return userRepository.getById(userId);
  },

  /**
   * Atualiza dados do perfil com auditoria.
   */
  async updateProfile(userId: string, data: Partial<Pick<UserEntity, 'name' | 'avatar' | 'location'>>): Promise<void> {
    await userRepository.update(userId, data);
  }
};
