import 'reflect-metadata';

import { AuthorBookHttpController } from './api/httpControllers/authorBookHttpController/authorBookHttpController';
import { AuthorBookRepositoryFactory } from './application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookModule } from './authorBookModule';
import { AuthorBookRepositoryFactoryImpl } from './infrastructure/repositories/authorBookRepository/authorBookRepositoryFactoryImpl';
import { authorBookSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { AuthorModule } from '../authorModule/authorModule';
import { BookModule } from '../bookModule/bookModule';

describe('AuthorBookModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new AuthorModule(),
        new BookModule(),
        new AuthorBookModule(),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<AuthorBookRepositoryFactory>(authorBookSymbols.authorBookRepositoryFactory)).toBeInstanceOf(
      AuthorBookRepositoryFactoryImpl,
    );

    expect(container.get<AuthorBookHttpController>(authorBookSymbols.authorBookHttpController)).toBeInstanceOf(
      AuthorBookHttpController,
    );
  });
});
