import { Product } from './constants';

export interface BaseOfflineEntity {
  id: string;
  empresaId: string;
  criadoEm: number;
  atualizadoEm: number;
  sincronizado: boolean;
  deletado: boolean;
}

export interface UserEntity extends BaseOfflineEntity {
  name: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  avatar?: string;
  location?: string;
  cards?: { id: number, type: string, last4: string, expiry: string, isDefault: boolean }[];
  addresses?: { id: number, type: string, detail: string, city: string, primary: boolean }[];
  favorites?: string[];
}

export interface ProductEntity extends BaseOfflineEntity {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  type: 'Casual' | 'Formal' | 'Desportivo';
  stock: number;
  rating?: number;
}

export interface OrderEntity extends BaseOfflineEntity {
  userId: string;
  items: any[];
  total: number;
  status: 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';
  date: string;
}

export interface StoreEntity extends BaseOfflineEntity {
  ownerId: string;
  name: string;
  logo?: string;
  description?: string;
  rating?: number;
}

export interface ComplaintEntity extends BaseOfflineEntity {
  userId: string;
  orderId?: string;
  message: string;
  title: string;
  reason: string;
  status: 'pendente' | 'em_analise' | 'resolvido';
  solution?: string;
}

export interface PaymentEntity extends BaseOfflineEntity {
  orderId: string;
  method: string;
  amount: number;
  status: 'sucesso' | 'falha' | 'pendente';
  comprovativoUrl?: string;
}

export interface SubscriptionEntity extends BaseOfflineEntity {
  sellerId: string;
  plan: 'silver' | 'gold' | 'diamond';
  status: 'active' | 'inactive';
  expiresAt: number;
}
