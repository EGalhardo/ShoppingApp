import { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { BaseOfflineEntity } from '../../types';

/**
 * Padrão Repository base para abstrair as operações do IndexedDB (Dexie)
 * Implementa isolamento por empresaId e lógica offline-first.
 */
export abstract class BaseRepository<T extends BaseOfflineEntity> {
  constructor(protected table: Table<T>) {}

  /**
   * Obtém todos os registos ativos para uma empresa específica.
   */
  async getAll(empresaId: string): Promise<T[]> {
    return this.table
      .where('empresaId')
      .equals(empresaId)
      .and(item => !item.deletado)
      .toArray();
  }

  /**
   * Obtém um registo pelo ID.
   */
  async getById(id: string): Promise<T | undefined> {
    const item = await this.table.get(id);
    return item && !item.deletado ? item : undefined;
  }

  /**
   * Cria um novo registo com metadados offline.
   */
  async create(data: Omit<T, keyof BaseOfflineEntity>, empresaId: string): Promise<string> {
    const now = Date.now();
    const id = uuidv4();
    
    // @ts-ignore
    const entity: T = {
      ...data,
      id,
      empresaId,
      criadoEm: now,
      atualizadoEm: now,
      sincronizado: false,
      deletado: false
    };

    await this.table.add(entity);
    return id;
  }

  /**
   * Cria um novo registo com um ID específico (útil para dados iniciais).
   */
  async createWithId(id: string, data: Omit<T, keyof BaseOfflineEntity>, empresaId: string): Promise<void> {
    const now = Date.now();
    
    // @ts-ignore
    const entity: T = {
      ...data,
      id,
      empresaId,
      criadoEm: now,
      atualizadoEm: now,
      sincronizado: false,
      deletado: false
    };

    await this.table.add(entity);
  }

  /**
   * Atualiza um registo existente e marca para sincronização.
   */
  async update(id: string, data: Partial<Omit<T, keyof BaseOfflineEntity>>): Promise<void> {
    const now = Date.now();
    await this.table.update(id, {
      ...data,
      atualizadoEm: now,
      sincronizado: false
    } as any);
  }

  /**
   * Implementa Soft Delete (deletado = true).
   */
  async delete(id: string): Promise<void> {
    const now = Date.now();
    await this.table.update(id, {
      deletado: true,
      atualizadoEm: now,
      sincronizado: false
    } as any);
  }

  /**
   * Obtém todos os registos que ainda não foram sincronizados com o servidor.
   */
  async getUnsynced(): Promise<T[]> {
    // Dexie filters work well for boolean checks
    // Usamos filter para garantir compatibilidade com booleans reais
    return this.table.filter(item => !item.sincronizado).toArray();
  }

  /**
   * Marca registos como sincronizados após sucesso no upload.
   */
  async markAsSynced(ids: string[]): Promise<void> {
    await this.table.bulkUpdate(ids.map(id => ({
      key: id,
      changes: { sincronizado: true } as any
    })));
  }
}
