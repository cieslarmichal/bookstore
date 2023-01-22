import { AwilixContainer, asClass, Lifetime } from 'awilix';

import { UserRepositoryFactoryImpl } from './implementations/factories/userRepositoryFactory/userRepositoryFactoryImpl';
import { UserMapperImpl } from './implementations/mappers/userMapper/userMapperImpl';
import { HashServiceImpl } from './implementations/services/hashService/hashServiceImpl';
import { TokenServiceImpl } from './implementations/services/tokenService/tokenServiceImpl';
import { UserServiceImpl } from './implementations/services/userService/userServiceImpl';
import { userSymbols } from './userSymbols';
import { Module } from '../../libs/dependencyInjection/module';

export class UserModule extends Module {
  public override async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [userSymbols.userMapper]: asClass(UserMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.userRepositoryFactory]: asClass(UserRepositoryFactoryImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.hashService]: asClass(HashServiceImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.tokenService]: asClass(TokenServiceImpl, { lifetime: Lifetime.SINGLETON }),
      [userSymbols.userService]: asClass(UserServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
