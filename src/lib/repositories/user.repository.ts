import { db } from '../database';
import { UserEntity } from '../../types';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super(db.users);
  }

  async getByEmail(empresaId: string, email: string): Promise<UserEntity | undefined> {
    return this.table
      .where({ empresaId, email })
      .filter(u => !u.deletado)
      .first();
  }

  async getByRole(empresaId: string, role: UserEntity['role']): Promise<UserEntity[]> {
    return this.table
      .where({ empresaId, role })
      .filter(u => !u.deletado)
      .toArray();
  }
}

export const userRepository = new UserRepository();
