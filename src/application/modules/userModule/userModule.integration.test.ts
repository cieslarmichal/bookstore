import 'reflect-metadata';

import { UserRepositoryFactory } from './application/repositories/userRepository/userRepositoryFactory';
import { HashService } from './application/services/hashService/hashService';
import { HashServiceImpl } from './application/services/hashService/hashServiceImpl';
import { TokenService } from './application/services/tokenService/tokenService';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl';
import { UserService } from './application/services/userService/userService';
import { UserServiceImpl } from './application/services/userService/userServiceImpl';
import { UserController } from './infrastructure/httpControllers/userController';
import { UserMapper } from './infrastructure/repositories/userRepository/userMapper/userMapper';
import { UserMapperImpl } from './infrastructure/repositories/userRepository/userMapper/userMapperImpl';
import { UserRepositoryFactoryImpl } from './infrastructure/repositories/userRepository/userRepositoryFactoryImpl';
import { UserModuleConfigTestFactory } from './tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from './userModule';
import { userModuleSymbols } from './userModuleSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('UserModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new UserModule(userModuleConfig),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<UserMapper>(userModuleSymbols.userMapper)).toBeInstanceOf(UserMapperImpl);

    expect(container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory)).toBeInstanceOf(
      UserRepositoryFactoryImpl,
    );

    expect(container.get<UserService>(userModuleSymbols.userService)).toBeInstanceOf(UserServiceImpl);

    expect(container.get<HashService>(userModuleSymbols.hashService)).toBeInstanceOf(HashServiceImpl);

    expect(container.get<TokenService>(userModuleSymbols.tokenService)).toBeInstanceOf(TokenServiceImpl);

    expect(container.get<UserController>(userModuleSymbols.userController)).toBeInstanceOf(UserController);
  });
});
