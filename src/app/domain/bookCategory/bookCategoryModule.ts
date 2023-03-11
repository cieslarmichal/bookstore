import { bookCategorySymbols } from './bookCategorySymbols';
import { BookCategoryRepositoryFactory } from './contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryMapper } from './contracts/mappers/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryService } from './contracts/services/bookCategoryService/bookCategoryService';
import { BookCategoryRepositoryFactoryImpl } from './implementations/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactoryImpl';
import { BookCategoryMapperImpl } from './implementations/mappers/bookCategoryMapper/bookCategoryMapperImpl';
import { BookCategoryServiceImpl } from './implementations/services/bookCategoryService/bookCategoryServiceImpl';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class BookCategoryModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<BookCategoryMapper>(bookCategorySymbols.bookCategoryMapper, BookCategoryMapperImpl);

    container.bindToConstructor<BookCategoryRepositoryFactory>(
      bookCategorySymbols.bookCategoryRepositoryFactory,
      BookCategoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<BookCategoryService>(bookCategorySymbols.bookCategoryService, BookCategoryServiceImpl);
  }
}
