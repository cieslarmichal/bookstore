import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../libs/dependencyInjection/loadableModule';
import { bookCategorySymbols } from './bookCategorySymbols';
import { BookCategoryRepositoryFactoryImpl } from './implementations/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactoryImpl';
import { BookCategoryMapperImpl } from './implementations/mappers/bookCategoryMapper/bookCategoryMapperImpl';
import { BookCategoryServiceImpl } from './implementations/services/bookCategoryService/bookCategoryServiceImpl';

export class BookCategoryModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [bookCategorySymbols.bookCategoryMapper]: asClass(BookCategoryMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [bookCategorySymbols.bookCategoryRepositoryFactory]: asClass(BookCategoryRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [bookCategorySymbols.bookCategoryService]: asClass(BookCategoryServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
