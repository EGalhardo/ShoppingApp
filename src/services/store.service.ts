import { storeRepository } from '../lib/repositories/other.repositories';
import { StoreEntity } from '../types';

export class StoreService {
  static async getStoreByOwner(empresaId: string, ownerId: string) {
    return storeRepository.getByOwner(empresaId, ownerId);
  }

  static async updateStore(id: string, data: Partial<Omit<StoreEntity, 'id' | 'empresaId'>>) {
    return storeRepository.update(id, data);
  }

  static async createStore(empresaId: string, ownerId: string, name: string) {
    return storeRepository.create({
      ownerId,
      name,
      description: '',
      rating: 5
    }, empresaId);
  }
}
