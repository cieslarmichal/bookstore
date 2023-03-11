import 'reflect-metadata';

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
import { UserModuleConfigTestFactory } from './tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from './userModule';
import { userSymbols } from './userSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
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
    expect.assertions(5);

    expect(container.get<UserMapper>(userSymbols.userMapper)).toBeInstanceOf(UserMapperImpl);

    expect(container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory)).toBeInstanceOf(
      UserRepositoryFactoryImpl,
    );

    expect(container.get<UserService>(userSymbols.userService)).toBeInstanceOf(UserServiceImpl);

    expect(container.get<HashService>(userSymbols.hashService)).toBeInstanceOf(HashServiceImpl);

    expect(container.get<TokenService>(userSymbols.tokenService)).toBeInstanceOf(TokenServiceImpl);
  });
});
