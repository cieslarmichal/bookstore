import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../libs/dependencyInjection/loadableModule';
import { AddressControllerImpl } from './address/implementations/controllers/addressController/addressControllerImpl';
import { AuthorControllerImpl } from './author/implementations/controllers/authorController/authorControllerImpl';
import { AuthorBookControllerImpl } from './authorBook/implementations/controllers/authorBookController/authorBookControllerImpl';
import { BookControllerImpl } from './book/implementations/controllers/bookController/bookControllerImpl';
import { BookCategoryControllerImpl } from './bookCategory/implementations/controllers/bookCategoryController/bookCategoryControllerImpl';
import { CategoryControllerImpl } from './category/implementations/controllers/categoryController/categoryControllerImpl';
import { FilterDataParser } from './common/filter/filterDataParser';
import { AuthMiddleware } from './common/middlewares/authMiddleware';
import { PaginationDataParser } from './common/pagination/paginationDataParser';
import { CustomerControllerImpl } from './customer/implementations/controllers/customerControllerImpl';
import { integrationsSymbols } from './integrationsSymbols';
import { UserControllerImpl } from './user/implementations/controllers/userController/userControllerImpl';

export class IntegrationsModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [integrationsSymbols.authMiddleware]: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.filterDataParser]: asClass(FilterDataParser, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.paginationDataParser]: asClass(PaginationDataParser, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.bookController]: asClass(BookControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.authorController]: asClass(AuthorControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.userController]: asClass(UserControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.categoryController]: asClass(CategoryControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.authorBookController]: asClass(AuthorBookControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.bookCategoryController]: asClass(BookCategoryControllerImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [integrationsSymbols.addressController]: asClass(AddressControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.customerController]: asClass(CustomerControllerImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
