import { BookCategoryRepositoryFactory } from './application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { BookCategoryService } from './application/services/bookCategoryService/bookCategoryService';
import { BookCategoryServiceImpl } from './application/services/bookCategoryService/bookCategoryServiceImpl';
import { bookCategoryModuleSymbols } from './bookCategoryModuleSymbols';
import { BookCategoryController } from './infrastructure/httpControllers/bookCategoryController';
import { BookCategoryMapper } from './infrastructure/repositories/bookCategoryRepository/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryMapperImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryMapper/bookCategoryMapperImpl';
import { BookCategoryRepositoryFactoryImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class BookCategoryModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<BookCategoryMapper>(
      bookCategoryModuleSymbols.bookCategoryMapper,
      BookCategoryMapperImpl,
    );

    container.bindToConstructor<BookCategoryRepositoryFactory>(
      bookCategoryModuleSymbols.bookCategoryRepositoryFactory,
      BookCategoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<BookCategoryService>(
      bookCategoryModuleSymbols.bookCategoryService,
      BookCategoryServiceImpl,
    );

    container.bindToConstructor<BookCategoryController>(
      bookCategoryModuleSymbols.bookCategoryController,
      BookCategoryController,
    );
  }
}
