import 'reflect-metadata';

import { BookModule } from './bookModule';
import { bookSymbols } from './bookSymbols';
import { BookRepositoryFactory } from './contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookMapper } from './contracts/mappers/bookMapper/bookMapper';
import { BookService } from './contracts/services/bookService/bookService';
import { BookRepositoryFactoryImpl } from './implementations/factories/bookRepositoryFactory/bookRepositoryFactoryImpl';
import { BookMapperImpl } from './implementations/mappers/bookMapper/bookMapperImpl';
import { BookServiceImpl } from './implementations/services/bookService/bookServiceImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('BookModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new BookModule()],
    });
  });

  it('declares bindings', async () => {
    expect.assertions(3);

    expect(container.get<BookMapper>(bookSymbols.bookMapper)).toBeInstanceOf(BookMapperImpl);

    expect(container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory)).toBeInstanceOf(
      BookRepositoryFactoryImpl,
    );

    expect(container.get<BookService>(bookSymbols.bookService)).toBeInstanceOf(BookServiceImpl);
  });
});
