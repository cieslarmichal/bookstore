import 'reflect-metadata';

import { BookHttpController } from './api/httpControllers/bookHttpController/bookHttpController';
import { FindBookQueryHandler } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandler';
import { FindBookQueryHandlerImpl } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandlerImpl';
import { BookRepositoryFactory } from './application/repositories/bookRepository/bookRepositoryFactory';
import { BookRepositoryFactoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryFactoryImpl';
import { bookSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('BookModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory)).toBeInstanceOf(
      BookRepositoryFactoryImpl,
    );

    expect(container.get<BookHttpController>(bookSymbols.bookHttpController)).toBeInstanceOf(BookHttpController);

    expect(container.get<FindBookQueryHandler>(bookSymbols.findBookQueryHandler)).toBeInstanceOf(
      FindBookQueryHandlerImpl,
    );
  });
});
