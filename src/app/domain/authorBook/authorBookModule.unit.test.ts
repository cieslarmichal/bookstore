import 'reflect-metadata';

import { AuthorBookModule } from './authorBookModule';
import { authorBookSymbols } from './authorBookSymbols';
import { AuthorBookService } from './contracts/services/authorBookService/authorBookService';
import { AuthorBookServiceImpl } from './implementations/services/authorBookService/authorBookServiceImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { AuthorModule } from '../author/authorModule';
import { BookModule } from '../book/bookModule';

describe('AuthorBookModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
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
    expect.assertions(1);

    expect(container.get<AuthorBookService>(authorBookSymbols.authorBookService)).toBeInstanceOf(AuthorBookServiceImpl);
  });
});
