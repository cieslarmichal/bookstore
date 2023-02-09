import 'reflect-metadata';

import { UserService } from './contracts/services/userService/userService';
import { UserServiceImpl } from './implementations/services/userService/userServiceImpl';
import { UserModuleConfigTestFactory } from './tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from './userModule';
import { userSymbols } from './userSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

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
    expect.assertions(1);

    expect(container.get<UserService>(userSymbols.userService)).toBeInstanceOf(UserServiceImpl);
  });
});
