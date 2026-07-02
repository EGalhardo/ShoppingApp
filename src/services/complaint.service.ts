import { ComplaintEntity } from '../types';
import { complaintRepository } from '../lib/repositories/complaint.repository';

/**
 * Serviço de Reclamações: Gere o suporte ao cliente.
 */
export const ComplaintService = {
  /**
   * Obtém todas as reclamações de um utilizador.
   */
  async listByUser(empresaId: string, userId: string): Promise<ComplaintEntity[]> {
    return complaintRepository.getByUser(empresaId, userId);
  },

  /**
   * Cria uma nova reclamação.
   */
  async createComplaint(empresaId: string, userId: string, data: { orderId?: string, title: string, reason: string, message: string }): Promise<string> {
    if (!data.message) throw new Error('A mensagem não pode estar vazia.');
    
    return complaintRepository.create({
      userId,
      orderId: data.orderId,
      title: data.title,
      reason: data.reason,
      message: data.message,
      status: 'pendente'
    }, empresaId);
  }
};
