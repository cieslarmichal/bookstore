import { FindConditions } from 'typeorm';
import { UserEntity } from '../../userEntity';
import { User } from '../../user';

export interface UserRepository {
  createOne(userData: Partial<UserEntity>): Promise<User>;
  findOne(conditions: FindConditions<UserEntity>): Promise<User | null>;
  findOneById(id: string): Promise<User | null>;
  findMany(conditions: FindConditions<UserEntity>): Promise<User[]>;
  updateOne(id: string, userData: Partial<UserEntity>): Promise<User>;
  removeOne(id: string): Promise<void>;
}
