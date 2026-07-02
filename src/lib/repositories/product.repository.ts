import { db } from '../database';
import { ProductEntity } from '../../types';
import { BaseRepository } from './base.repository';

/**
 * Repositório especializado para Produtos.
 */
export class ProductRepository extends BaseRepository<ProductEntity> {
  constructor() {
    super(db.products);
  }

  /**
   * Busca produtos por categoria mantendo o isolamento multiempresa.
   */
  async getByCategory(empresaId: string, category: string): Promise<ProductEntity[]> {
    return this.table
      .where('empresaId')
      .equals(empresaId)
      .and(item => item.category === category && !item.deletado)
      .toArray();
  }

  /**
   * Busca rápida por nome.
   */
  async searchByName(empresaId: string, query: string): Promise<ProductEntity[]> {
    const lowerQuery = query.toLowerCase();
    return this.table
      .where('empresaId')
      .equals(empresaId)
      .and(item => item.name.toLowerCase().includes(lowerQuery) && !item.deletado)
      .toArray();
  }
}

export const productRepository = new ProductRepository();
