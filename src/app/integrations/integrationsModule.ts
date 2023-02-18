import { AddressController } from './address/implementations/addressController';
import { AuthorController } from './author/implementations/authorController';
import { AuthorBookController } from './authorBook/implementations/authorBookController';
import { BookController } from './book/implementations/bookController';
import { BookCategoryController } from './bookCategory/implementations/bookCategoryController';
import { CartController } from './cart/implementations/cartController';
import { CategoryController } from './category/implementations/categoryController';
import { FilterDataParser } from './common/filterDataParser/filterDataParser';
import { AuthMiddleware } from './common/middlewares/authMiddleware';
import { PaginationDataBuilder } from './common/paginationDataBuilder/paginationDataBuilder';
import { CustomerController } from './customer/implementations/customerController';
import { integrationsSymbols } from './integrationsSymbols';
import { UserController } from './user/implementations/userController';
import { DependencyInjectionModule } from '../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class IntegrationsModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<AuthMiddleware>(integrationsSymbols.authMiddleware, AuthMiddleware);

    container.bindToConstructor<FilterDataParser>(integrationsSymbols.filterDataParser, FilterDataParser);

    container.bindToConstructor<PaginationDataBuilder>(
      integrationsSymbols.paginationDataBuilder,
      PaginationDataBuilder,
    );

    container.bindToConstructor<BookController>(integrationsSymbols.bookController, BookController);

    container.bindToConstructor<AuthorController>(integrationsSymbols.authorController, AuthorController);

    container.bindToConstructor<UserController>(integrationsSymbols.userController, UserController);

    container.bindToConstructor<CategoryController>(integrationsSymbols.categoryController, CategoryController);

    container.bindToConstructor<AuthorBookController>(integrationsSymbols.authorBookController, AuthorBookController);

    container.bindToConstructor<BookCategoryController>(
      integrationsSymbols.bookCategoryController,
      BookCategoryController,
    );

    container.bindToConstructor<AddressController>(integrationsSymbols.addressController, AddressController);

    container.bindToConstructor<CustomerController>(integrationsSymbols.customerController, CustomerController);

    container.bindToConstructor<CartController>(integrationsSymbols.cartController, CartController);
  }
}
