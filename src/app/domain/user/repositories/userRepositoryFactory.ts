import { EntityManager } from 'typeorm';
import { UserMapper } from '../mappers/userMapper';
import { UserRepository } from './userRepository';

export class UserRepositoryFactory {
  public constructor(private readonly userMapper: UserMapper) {}

  public create(entityManager: EntityManager): UserRepository {
    return new UserRepository(entityManager, this.userMapper);
  }
}
