import { 
  productRepository, 
  userRepository, 
  orderRepository, 
  storeRepository, 
  paymentRepository, 
  subscriptionRepository 
} from '../lib/repositories';
import { BaseOfflineEntity } from '../types';

/**
 * SyncService: Responsável por coordenar o fluxo entre LocalDB e API.
 */
export const SyncService = {
  
  /**
   * Verifica se o dispositivo tem conectividade com o servidor.
   */
  async isOnline(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.warn('Network health check failed:', error);
      return false;
    }
  },

  /**
   * Executa um ciclo completo de sincronização (Push then Pull) com tratamento de erros.
   */
  async fullSync(empresaId: string): Promise<{ pushed: number, pulled: number }> {
    if (!(await this.isOnline())) {
      console.warn('📶 Dispositivo OFFLINE. Sincronização adiada.');
      return { pushed: 0, pulled: 0 };
    }

    console.log('🔄 Iniciando sincronização para empresa:', empresaId);
    
    try {
      const pushedCount = await this.pushLocalChanges();
      const pulledCount = await this.pullRemoteChanges(empresaId);
      
      this.logSyncEvent(empresaId, 'success', { pushed: pushedCount, pulled: pulledCount });
      return { pushed: pushedCount, pulled: pulledCount };
    } catch (error) {
      console.error('❌ Erro durante a sincronização:', error);
      this.logSyncEvent(empresaId, 'error', { error: String(error) });
      throw error;
    }
  },

  /**
   * PUSH: Envia dados locais pendentes para o servidor.
   */
  async pushLocalChanges(): Promise<number> {
    const repos = [
      productRepository, userRepository, orderRepository, 
      storeRepository, paymentRepository, subscriptionRepository
    ];
    
    let totalPushed = 0;

    for (const repo of repos) {
      const unsynced = await repo.getUnsynced();
      
      if (unsynced.length > 0) {
        const empresaId = unsynced[0].empresaId;
        
        try {
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-empresa-id': empresaId
            },
            body: JSON.stringify({ entities: unsynced })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(`Erro API Push (${response.status}): ${errorData.error || response.statusText}`);
          }
          
          await repo.markAsSynced(unsynced.map(u => u.id));
          totalPushed += unsynced.length;
        } catch (err) {
          console.error(`Falha ao sincronizar lote do repositório:`, err);
          // Não interrompemos o loop para tentar os outros repositórios
        }
      }
    }

    return totalPushed;
  },

  /**
   * PULL: Busca alterações do servidor baseadas no último timestamp sincronizado.
   */
  async pullRemoteChanges(empresaId: string): Promise<number> {
    const lastSync = localStorage.getItem(`lastSync_${empresaId}`) || '0';
    
    const response = await fetch(`/api/sync?updatedAfter=${lastSync}`, {
      headers: { 'x-empresa-id': empresaId }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Sync Pull Error (${response.status}): ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    const changes = data.changes || { products: [], orders: [], users: [] };
    let updatedCount = 0;

    // Processar produtos recebidos (Repetir padrão para outras entidades)
    if (changes.products) {
      for (const remoteItem of changes.products) {
        const localItem = await productRepository.getById(remoteItem.id);
        
        if (!localItem || remoteItem.atualizadoEm > localItem.atualizadoEm) {
          // @ts-ignore
          await productRepository['table'].put({ ...remoteItem, sincronizado: true });
          updatedCount++;
        }
      }
    }

    localStorage.setItem(`lastSync_${empresaId}`, Date.now().toString());
    return updatedCount;
  },

  /**
   * Auditoria básica de sincronização.
   */
  logSyncEvent(empresaId: string, status: 'success' | 'error', details: any) {
    const logs = JSON.parse(localStorage.getItem(`sync_logs_${empresaId}`) || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      status,
      ...details
    });
    // Manter apenas os últimos 50 logs
    localStorage.setItem(`sync_logs_${empresaId}`, JSON.stringify(logs.slice(-50)));
  }
};
