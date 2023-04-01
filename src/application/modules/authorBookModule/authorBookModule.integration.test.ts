import 'reflect-metadata';

import { AuthorBookRepositoryFactory } from './application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookService } from './application/services/authorBookService/authorBookService';
import { AuthorBookServiceImpl } from './application/services/authorBookService/authorBookServiceImpl';
import { AuthorBookModule } from './authorBookModule';
import { authorBookModuleSymbols } from './authorBookModuleSymbols';
import { AuthorBookController } from './infrastructure/httpControllers/authorBookController';
import { AuthorBookMapper } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapper';
import { AuthorBookMapperImpl } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapperImpl';
import { AuthorBookRepositoryFactoryImpl } from './infrastructure/repositories/authorBookRepository/authorBookRepositoryFactoryImpl';
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
    expect(container.get<AuthorBookMapper>(authorBookModuleSymbols.authorBookMapper)).toBeInstanceOf(
      AuthorBookMapperImpl,
    );

    expect(
      container.get<AuthorBookRepositoryFactory>(authorBookModuleSymbols.authorBookRepositoryFactory),
    ).toBeInstanceOf(AuthorBookRepositoryFactoryImpl);

    expect(container.get<AuthorBookService>(authorBookModuleSymbols.authorBookService)).toBeInstanceOf(
      AuthorBookServiceImpl,
    );

    expect(container.get<AuthorBookController>(authorBookModuleSymbols.authorBookController)).toBeInstanceOf(
      AuthorBookController,
    );
  });
});
