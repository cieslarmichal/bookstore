import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../libs/di/loadableModule';
import { bookSymbols } from './bookSymbols';
import { BookRepositoryFactoryImpl } from './implementations/factories/bookRepositoryFactory/bookRepositoryFactoryImpl';
import { BookMapperImpl } from './implementations/mappers/bookMapper/bookMapperImpl';
import { BookServiceImpl } from './implementations/services/bookService/bookServiceImpl';

export class BookModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [bookSymbols.bookMapper]: asClass(BookMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [bookSymbols.bookRepositoryFactory]: asClass(BookRepositoryFactoryImpl, { lifetime: Lifetime.SINGLETON }),
      [bookSymbols.bookService]: asClass(BookServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
