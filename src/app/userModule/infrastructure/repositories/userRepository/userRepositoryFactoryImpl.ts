import { EntityManager } from 'typeorm';

import { UserMapper } from './userMapper/userMapper';
import { UserRepositoryImpl } from './userRepositoryImpl';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { UserRepository } from '../../../application/repositories/userRepository/userRepository';
import { UserRepositoryFactory } from '../../../application/repositories/userRepository/userRepositoryFactory';
import { userModuleSymbols } from '../../../userModuleSymbols';

@Injectable()
export class UserRepositoryFactoryImpl implements UserRepositoryFactory {
  public constructor(
    @Inject(userModuleSymbols.userMapper)
    private readonly userMapper: UserMapper,
  ) {}

  public create(entityManager: EntityManager): UserRepository {
    return new UserRepositoryImpl(entityManager, this.userMapper);
  }
}
