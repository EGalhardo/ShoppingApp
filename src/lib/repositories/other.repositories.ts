import { db } from '../database';
import { StoreEntity, PaymentEntity, SubscriptionEntity } from '../../types';
import { BaseRepository } from './base.repository';

// Repositório de Lojas (Perfil de Vendedor)
export class StoreRepository extends BaseRepository<StoreEntity> {
  constructor() {
    super(db.stores);
  }

  async getByOwner(empresaId: string, ownerId: string): Promise<StoreEntity | undefined> {
    return this.table.where({ empresaId, ownerId }).filter(s => !s.deletado).first();
  }
}

// Repositório de Pagamentos
export class PaymentRepository extends BaseRepository<PaymentEntity> {
  constructor() {
    super(db.payments);
  }

  async getByOrder(orderId: string): Promise<PaymentEntity | undefined> {
    return this.table.where({ orderId }).filter(p => !p.deletado).first();
  }
}

// Repositório de Assinaturas
export class SubscriptionRepository extends BaseRepository<SubscriptionEntity> {
  constructor() {
    super(db.subscriptions);
  }

  async getBySeller(sellerId: string): Promise<SubscriptionEntity | undefined> {
    return this.table.where({ sellerId }).filter(s => !s.deletado).first();
  }
}

export const storeRepository = new StoreRepository();
export const paymentRepository = new PaymentRepository();
export const subscriptionRepository = new SubscriptionRepository();
