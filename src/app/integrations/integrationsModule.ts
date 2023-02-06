import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { AddressController } from './address/implementations/controllers/addressController/addressController';
import { AuthorController } from './author/implementations/controllers/authorController/authorController';
import { AuthorBookController } from './authorBook/implementations/controllers/authorBookController/authorBookController';
import { BookController } from './book/implementations/controllers/bookController/bookController';
import { BookCategoryController } from './bookCategory/implementations/controllers/bookCategoryController/bookCategoryController';
import { CategoryController } from './category/implementations/controllers/categoryController/categoryController';
import { FilterDataParser } from './common/filterDataParser/filterDataParser';
import { AuthMiddleware } from './common/middlewares/authMiddleware';
import { PaginationDataBuilder } from './common/paginationDataBuilder/paginationDataBuilder';
import { CustomerController } from './customer/implementations/controllers/customerController/customerController';
import { integrationsSymbols } from './integrationsSymbols';
import { UserController } from './user/implementations/controllers/userController/userController';
import { DependencyInjectionModule } from '../libs/dependencyInjection/contracts/dependencyInjectionModule';

export class IntegrationsModule implements DependencyInjectionModule {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [integrationsSymbols.authMiddleware]: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.filterDataParser]: asClass(FilterDataParser, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.paginationDataBuilder]: asClass(PaginationDataBuilder, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.bookController]: asClass(BookController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.authorController]: asClass(AuthorController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.userController]: asClass(UserController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.categoryController]: asClass(CategoryController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.authorBookController]: asClass(AuthorBookController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.bookCategoryController]: asClass(BookCategoryController, {
        lifetime: Lifetime.SINGLETON,
      }),
      [integrationsSymbols.addressController]: asClass(AddressController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.customerController]: asClass(CustomerController, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
