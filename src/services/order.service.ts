import { OrderEntity, ProductEntity } from '../types';
import { orderRepository } from '../lib/repositories';
import { ProductService } from './product.service';

/**
 * Serviço de Pedidos: Gere o fluxo de compra e status.
 */
export const OrderService = {
  /**
   * Processa a criação de um pedido, baixando stock e validando items.
   */
  async placeOrder(empresaId: string, userId: string, items: { id: string, name: string, price: number, quantity: number }[]): Promise<string> {
    if (items.length === 0) throw new Error('Carrinho vazio.');

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // 1. Criar o pedido
    const orderId = await orderRepository.create({
      userId,
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      total,
      status: 'pendente',
      date: new Date().toISOString()
    }, empresaId);

    // 2. Tentar baixar stock para cada item (regra de integridade)
    try {
      for (const item of items) {
        await ProductService.updateStock(item.id, -item.quantity);
      }
    } catch (error) {
      // Nota: Numa arquitetura real offline, poderíamos reverter ou marcar erro.
      // Aqui vamos apenas propagar o erro de stock insuficiente.
      throw error;
    }

    return orderId;
  },

  /**
   * Altera status do pedido (ex: Administrador validando pagamento).
   */
  async updateStatus(orderId: string, status: OrderEntity['status']): Promise<void> {
    await orderRepository.update(orderId, { status });
  }
};
