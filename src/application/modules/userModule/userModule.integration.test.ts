import 'reflect-metadata';

import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController';
import { UserRepositoryFactory } from './application/repositories/userRepository/userRepositoryFactory';
import { TokenService } from './application/services/tokenService/tokenService';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl';
import { UserRepositoryFactoryImpl } from './infrastructure/repositories/userRepository/userRepositoryFactoryImpl';
import { userSymbols } from './symbols';
import { UserModuleConfigTestFactory } from './tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from './userModule';
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
    container = DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new UserModule(userModuleConfig),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory)).toBeInstanceOf(
      UserRepositoryFactoryImpl,
    );

    expect(container.get<TokenService>(userSymbols.tokenService)).toBeInstanceOf(TokenServiceImpl);

    expect(container.get<UserHttpController>(userSymbols.userHttpController)).toBeInstanceOf(UserHttpController);
  });
});
