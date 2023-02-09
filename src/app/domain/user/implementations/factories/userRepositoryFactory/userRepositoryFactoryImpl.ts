import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { UserRepositoryFactory } from '../../../contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserMapper } from '../../../contracts/mappers/userMapper/userMapper';
import { UserRepository } from '../../../contracts/repositories/userRepository/userRepository';
import { userSymbols } from '../../../userSymbols';
import { UserRepositoryImpl } from '../../repositories/userRepository/userRepositoryImpl';

@Injectable()
export class UserRepositoryFactoryImpl implements UserRepositoryFactory {
  public constructor(
    @Inject(userSymbols.userMapper)
    private readonly userMapper: UserMapper,
  ) {}

  public create(entityManager: EntityManager): UserRepository {
    return new UserRepositoryImpl(entityManager, this.userMapper);
  }
}
