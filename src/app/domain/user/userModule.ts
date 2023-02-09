import { UserRepositoryFactory } from './contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserMapper } from './contracts/mappers/userMapper/userMapper';
import { HashService } from './contracts/services/hashService/hashService';
import { TokenService } from './contracts/services/tokenService/tokenService';
import { UserService } from './contracts/services/userService/userService';
import { UserRepositoryFactoryImpl } from './implementations/factories/userRepositoryFactory/userRepositoryFactoryImpl';
import { UserMapperImpl } from './implementations/mappers/userMapper/userMapperImpl';
import { HashServiceImpl } from './implementations/services/hashService/hashServiceImpl';
import { TokenServiceImpl } from './implementations/services/tokenService/tokenServiceImpl';
import { UserServiceImpl } from './implementations/services/userService/userServiceImpl';
import { UserModuleConfig } from './userModuleConfig';
import { userSymbols } from './userSymbols';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class UserModule implements DependencyInjectionModule {
  public constructor(private readonly config: UserModuleConfig) {}

  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToValue<UserModuleConfig>(userSymbols.userModuleConfig, this.config);

    container.bindToConstructor<UserMapper>(userSymbols.userMapper, UserMapperImpl);

    container.bindToConstructor<UserRepositoryFactory>(userSymbols.userRepositoryFactory, UserRepositoryFactoryImpl);

    container.bindToConstructor<UserService>(userSymbols.userService, UserServiceImpl);

    container.bindToConstructor<HashService>(userSymbols.hashService, HashServiceImpl);

    container.bindToConstructor<TokenService>(userSymbols.tokenService, TokenServiceImpl);
  }
}
