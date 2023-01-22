import { FindConditions } from 'typeorm';

import { User } from '../../user';
import { UserEntity } from '../../userEntity';

export interface UserRepository {
  createOne(userData: Partial<UserEntity>): Promise<User>;
  findOne(conditions: FindConditions<UserEntity>): Promise<User | null>;
  findOneById(id: string): Promise<User | null>;
  findMany(conditions: FindConditions<UserEntity>): Promise<User[]>;
  updateOne(id: string, userData: Partial<UserEntity>): Promise<User>;
  removeOne(id: string): Promise<void>;
}
