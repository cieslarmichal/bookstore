import 'reflect-metadata';

import { AuthorRepositoryFactory } from './application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorService } from './application/services/authorService/authorService';
import { AuthorServiceImpl } from './application/services/authorService/authorServiceImpl';
import { AuthorModule } from './authorModule';
import { authorModuleSymbols } from './authorModuleSymbols';
import { AuthorMapper } from './infrastructure/repositories/authorRepository/authorMapper/authorMapper';
import { AuthorMapperImpl } from './infrastructure/repositories/authorRepository/authorMapper/authorMapperImpl';
import { AuthorRepositoryFactoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('AuthorModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new AuthorModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(3);

    expect(container.get<AuthorMapper>(authorModuleSymbols.authorMapper)).toBeInstanceOf(AuthorMapperImpl);

    expect(container.get<AuthorRepositoryFactory>(authorModuleSymbols.authorRepositoryFactory)).toBeInstanceOf(
      AuthorRepositoryFactoryImpl,
    );

    expect(container.get<AuthorService>(authorModuleSymbols.authorService)).toBeInstanceOf(AuthorServiceImpl);
  });
});
