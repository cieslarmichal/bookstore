import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController';
import { UserRepositoryFactory } from './application/repositories/userRepository/userRepositoryFactory';
import { HashService } from './application/services/hashService/hashService';
import { HashServiceImpl } from './application/services/hashService/hashServiceImpl';
import { TokenService } from './application/services/tokenService/tokenService';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl';
import { UserService } from './application/services/userService/userService';
import { UserServiceImpl } from './application/services/userService/userServiceImpl';
import { UserMapper } from './infrastructure/repositories/userRepository/userMapper/userMapper';
import { UserMapperImpl } from './infrastructure/repositories/userRepository/userMapper/userMapperImpl';
import { UserRepositoryFactoryImpl } from './infrastructure/repositories/userRepository/userRepositoryFactoryImpl';
import { UserModuleConfig } from './userModuleConfig';
import { userModuleSymbols } from './userModuleSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class UserModule implements DependencyInjectionModule {
  public constructor(private readonly config: UserModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<UserModuleConfig>(userModuleSymbols.userModuleConfig, this.config);

    container.bindToConstructor<UserMapper>(userModuleSymbols.userMapper, UserMapperImpl);

    container.bindToConstructor<UserRepositoryFactory>(
      userModuleSymbols.userRepositoryFactory,
      UserRepositoryFactoryImpl,
    );

    container.bindToConstructor<UserService>(userModuleSymbols.userService, UserServiceImpl);

    container.bindToConstructor<HashService>(userModuleSymbols.hashService, HashServiceImpl);

    container.bindToConstructor<TokenService>(userModuleSymbols.tokenService, TokenServiceImpl);

    container.bindToConstructor<UserHttpController>(userModuleSymbols.userHttpController, UserHttpController);
  }
}
