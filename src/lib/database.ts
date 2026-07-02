import Dexie, { Table } from 'dexie';
import { 
  UserEntity, 
  ProductEntity, 
  OrderEntity, 
  StoreEntity, 
  ComplaintEntity, 
  PaymentEntity, 
  SubscriptionEntity 
} from '../types';

export class AppDatabase extends Dexie {
  users!: Table<UserEntity>;
  products!: Table<ProductEntity>;
  orders!: Table<OrderEntity>;
  stores!: Table<StoreEntity>;
  complaints!: Table<ComplaintEntity>;
  payments!: Table<PaymentEntity>;
  subscriptions!: Table<SubscriptionEntity>;

  constructor() {
    super('ModaAngolaDB');
    
    // Version 1 of the schema
    this.version(1).stores({
      users: 'id, empresaId, email, role, sincronizado, deletado',
      products: 'id, empresaId, category, price, sincronizado, deletado',
      orders: 'id, empresaId, userId, status, sincronizado, deletado',
      stores: 'id, empresaId, ownerId, sincronizado, deletado',
      complaints: 'id, empresaId, userId, sincronizado, deletado',
      payments: 'id, empresaId, orderId, sincronizado, deletado',
      subscriptions: 'id, empresaId, sellerId, sincronizado, deletado'
    });
  }
}

export const db = new AppDatabase();
