import { AwilixContainer, asClass, Lifetime, asValue } from 'awilix';

import { UserRepositoryFactoryImpl } from './implementations/factories/userRepositoryFactory/userRepositoryFactoryImpl';
import { UserMapperImpl } from './implementations/mappers/userMapper/userMapperImpl';
import { HashServiceImpl } from './implementations/services/hashService/hashServiceImpl';
import { TokenServiceImpl } from './implementations/services/tokenService/tokenServiceImpl';
import { UserServiceImpl } from './implementations/services/userService/userServiceImpl';
import { UserModuleConfig } from './userModuleConfig';
import { userSymbols } from './userSymbols';
import { Module } from '../../libs/dependencyInjection/module';

export class UserModule implements Module {
  public constructor(private readonly config: UserModuleConfig) {}

  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [userSymbols.userModuleConfig]: asValue(this.config),
      [userSymbols.userMapper]: asClass(UserMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.userRepositoryFactory]: asClass(UserRepositoryFactoryImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.hashService]: asClass(HashServiceImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.tokenService]: asClass(TokenServiceImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.userService]: asClass(UserServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
