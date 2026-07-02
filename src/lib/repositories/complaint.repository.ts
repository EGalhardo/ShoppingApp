import { db } from '../database';
import { ComplaintEntity } from '../../types';
import { BaseRepository } from './base.repository';

export class ComplaintRepository extends BaseRepository<ComplaintEntity> {
  constructor() {
    super(db.complaints);
  }

  async getByUser(empresaId: string, userId: string): Promise<ComplaintEntity[]> {
    return this.table.where({ empresaId, userId }).filter(c => !c.deletado).toArray();
  }
}

export const complaintRepository = new ComplaintRepository();
