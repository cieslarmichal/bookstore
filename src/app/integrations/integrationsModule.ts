import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { AddressController } from './address/implementations/controllers/addressController/addressController';
import { AuthorController } from './author/implementations/controllers/authorController/authorController';
import { AuthorBookControllerImpl } from './authorBook/implementations/controllers/authorBookController/authorBookControllerImpl';
import { BookControllerImpl } from './book/implementations/controllers/bookController/bookControllerImpl';
import { BookCategoryControllerImpl } from './bookCategory/implementations/controllers/bookCategoryController/bookCategoryControllerImpl';
import { CategoryControllerImpl } from './category/implementations/controllers/categoryController/categoryControllerImpl';
import { FilterDataParser } from './common/filter/filterDataParser';
import { AuthMiddleware } from './common/middlewares/authMiddleware';
import { PaginationDataParser } from './common/pagination/paginationDataParser';
import { CustomerControllerImpl } from './customer/implementations/controllers/customerController/customerControllerImpl';
import { integrationsSymbols } from './integrationsSymbols';
import { UserControllerImpl } from './user/implementations/controllers/userController/userControllerImpl';
import { Module } from '../libs/dependencyInjection/module';

export class IntegrationsModule implements Module {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [integrationsSymbols.authMiddleware]: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.filterDataParser]: asClass(FilterDataParser, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.paginationDataParser]: asClass(PaginationDataParser, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.bookController]: asClass(BookControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.authorController]: asClass(AuthorController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.userController]: asClass(UserControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.categoryController]: asClass(CategoryControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.authorBookController]: asClass(AuthorBookControllerImpl, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.bookCategoryController]: asClass(BookCategoryControllerImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [integrationsSymbols.addressController]: asClass(AddressController, { lifetime: Lifetime.SINGLETON }),
      [integrationsSymbols.customerController]: asClass(CustomerControllerImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
