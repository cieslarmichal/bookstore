import { bookSymbols } from './bookSymbols';
import { BookRepositoryFactory } from './contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookMapper } from './contracts/mappers/bookMapper/bookMapper';
import { BookService } from './contracts/services/bookService/bookService';
import { BookRepositoryFactoryImpl } from './implementations/factories/bookRepositoryFactory/bookRepositoryFactoryImpl';
import { BookMapperImpl } from './implementations/mappers/bookMapper/bookMapperImpl';
import { BookServiceImpl } from './implementations/services/bookService/bookServiceImpl';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class BookModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<BookMapper>(bookSymbols.bookMapper, BookMapperImpl);

    container.bindToConstructor<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory, BookRepositoryFactoryImpl);

    container.bindToConstructor<BookService>(bookSymbols.bookService, BookServiceImpl);
  }
}
