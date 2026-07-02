import { ProductEntity } from '../types';
import { productRepository } from '../lib/repositories';

/**
 * Serviço de Produtos: Implementa regras de negócio para o catálogo.
 */
export const ProductService = {
  /**
   * Obtém todos os produtos ativos para a loja/empresa atual.
   */
  async listProducts(empresaId: string): Promise<ProductEntity[]> {
    return productRepository.getAll(empresaId);
  },

  /**
   * Busca por categoria com validação.
   */
  async getByCategory(empresaId: string, category: string): Promise<ProductEntity[]> {
    if (!category) return [];
    return productRepository.getByCategory(empresaId, category);
  },

  /**
   * Adiciona um produto com validação de campos obrigatórios.
   */
  async createProduct(empresaId: string, data: Omit<ProductEntity, keyof import('../types').BaseOfflineEntity>): Promise<string> {
    if (!data.name || data.price <= 0) {
      throw new Error('Nome inválido ou preço deve ser maior que zero.');
    }
    
    if (data.stock < 0) {
      throw new Error('O stock não pode ser negativo.');
    }

    return productRepository.create(data, empresaId);
  },

  /**
   * Atualiza stock de forma segura.
   */
  async updateStock(productId: string, quantity: number): Promise<void> {
    const product = await productRepository.getById(productId);
    if (!product) throw new Error('Produto não encontrado.');
    
    const newStock = product.stock + quantity;
    if (newStock < 0) throw new Error('Stock insuficiente.');

    await productRepository.update(productId, { stock: newStock });
  }
};
