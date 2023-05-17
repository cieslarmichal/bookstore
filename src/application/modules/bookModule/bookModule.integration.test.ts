import 'reflect-metadata';

import { BookHttpController } from './api/httpControllers/bookHttpController/bookHttpController';
import { BookRepositoryFactory } from './application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from './bookModule';
import { BookRepositoryFactoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryFactoryImpl';
import { bookSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('BookModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new BookModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory)).toBeInstanceOf(
      BookRepositoryFactoryImpl,
    );

    expect(container.get<BookHttpController>(bookSymbols.bookHttpController)).toBeInstanceOf(BookHttpController);
  });
});
