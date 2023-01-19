import { EntityManager } from 'typeorm';
import { UserRepositoryFactory } from '../../../contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { UserRepository } from '../../../contracts/repositories/userRepository/userRepository';
import { UserRepositoryImpl } from '../../repositories/userRepository/userRepositoryImpl';

export class UserRepositoryFactoryImpl implements UserRepositoryFactory {
  public constructor(private readonly userMapper: UserMapper) {}

  public create(entityManager: EntityManager): UserRepository {
    return new UserRepositoryImpl(entityManager, this.userMapper);
  }
}
