import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { bookCategorySymbols } from './bookCategorySymbols';
import { BookCategoryRepositoryFactoryImpl } from './implementations/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactoryImpl';
import { BookCategoryMapperImpl } from './implementations/mappers/bookCategoryMapper/bookCategoryMapperImpl';
import { BookCategoryServiceImpl } from './implementations/services/bookCategoryService/bookCategoryServiceImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';

export class BookCategoryModule implements DependencyInjectionModule {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [bookCategorySymbols.bookCategoryMapper]: asClass(BookCategoryMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [bookCategorySymbols.bookCategoryRepositoryFactory]: asClass(BookCategoryRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [bookCategorySymbols.bookCategoryService]: asClass(BookCategoryServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
