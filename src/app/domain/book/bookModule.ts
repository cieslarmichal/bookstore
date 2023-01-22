import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { bookSymbols } from './bookSymbols';
import { BookRepositoryFactoryImpl } from './implementations/factories/bookRepositoryFactory/bookRepositoryFactoryImpl';
import { BookMapperImpl } from './implementations/mappers/bookMapper/bookMapperImpl';
import { BookServiceImpl } from './implementations/services/bookService/bookServiceImpl';
import { Module } from '../../libs/dependencyInjection/module';

export class BookModule implements Module {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [bookSymbols.bookMapper]: asClass(BookMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [bookSymbols.bookRepositoryFactory]: asClass(BookRepositoryFactoryImpl, { lifetime: Lifetime.SINGLETON }),
      [bookSymbols.bookService]: asClass(BookServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
