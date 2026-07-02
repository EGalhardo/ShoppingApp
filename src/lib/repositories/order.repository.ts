import { db } from '../database';
import { OrderEntity } from '../../types';
import { BaseRepository } from './base.repository';

export class OrderRepository extends BaseRepository<OrderEntity> {
  constructor() {
    super(db.orders);
  }

  async getByUserId(empresaId: string, userId: string): Promise<OrderEntity[]> {
    return this.table
      .where({ empresaId, userId })
      .and(item => !item.deletado)
      .toArray();
  }

  async getByStatus(empresaId: string, status: OrderEntity['status']): Promise<OrderEntity[]> {
    return this.table
      .where({ empresaId, status })
      .and(item => !item.deletado)
      .toArray();
  }
}

export const orderRepository = new OrderRepository();
