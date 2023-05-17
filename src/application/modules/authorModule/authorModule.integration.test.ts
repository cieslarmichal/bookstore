import 'reflect-metadata';

import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController';
import { AuthorRepositoryFactory } from './application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorModule } from './authorModule';
import { AuthorRepositoryFactoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryFactoryImpl';
import { authorSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('AuthorModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new AuthorModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<AuthorRepositoryFactory>(authorSymbols.authorRepositoryFactory)).toBeInstanceOf(
      AuthorRepositoryFactoryImpl,
    );
    expect(container.get<AuthorHttpController>(authorSymbols.authorHttpController)).toBeInstanceOf(
      AuthorHttpController,
    );
  });
});
