import 'reflect-metadata';

import { AuthorModule } from './authorModule';
import { authorSymbols } from './authorSymbols';
import { AuthorRepositoryFactory } from './contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorMapper } from './contracts/mappers/authorMapper/authorMapper';
import { AuthorService } from './contracts/services/authorService/authorService';
import { AuthorRepositoryFactoryImpl } from './implementations/factories/authorRepositoryFactory/authorRepositoryFactoryImpl';
import { AuthorMapperImpl } from './implementations/mappers/authorMapper/authorMapperImpl';
import { AuthorServiceImpl } from './implementations/services/authorService/authorServiceImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

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

    expect(container.get<AuthorMapper>(authorSymbols.authorMapper)).toBeInstanceOf(AuthorMapperImpl);

    expect(container.get<AuthorRepositoryFactory>(authorSymbols.authorRepositoryFactory)).toBeInstanceOf(
      AuthorRepositoryFactoryImpl,
    );

    expect(container.get<AuthorService>(authorSymbols.authorService)).toBeInstanceOf(AuthorServiceImpl);
  });
});
