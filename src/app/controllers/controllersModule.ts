import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../shared';
import { AddressController } from './address/addressController';
import { AuthorController } from './author/authorController';
import { AuthorBookController } from './authorBook/authorBookController';
import { BookController } from './book/bookController';
import { BookCategoryController } from './bookCategory/bookCategoryController';
import { CategoryController } from './category/categoryController';
import {
  ADDRESS_CONTROLLER,
  AUTHOR_BOOK_CONTROLLER,
  AUTHOR_CONTROLLER,
  AUTH_MIDDLEWARE,
  AUTH_SERVICE,
  BOOK_CATEGORY_CONTROLLER,
  BOOK_CONTROLLER,
  CATEGORY_CONTROLLER,
  CUSTOMER_CONTROLLER,
  USER_CONTROLLER,
} from './controllersInjectionSymbols';
import { CustomerController } from './customer/addressController';
import { AuthMiddleware } from './shared';
import { AuthService } from './shared';
import { UserController } from './user/userController';

export class ControllersModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [AUTH_SERVICE]: asClass(AuthService, { lifetime: Lifetime.SINGLETON }),
      [AUTH_MIDDLEWARE]: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),
      [BOOK_CONTROLLER]: asClass(BookController, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_CONTROLLER]: asClass(AuthorController, { lifetime: Lifetime.SINGLETON }),
      [USER_CONTROLLER]: asClass(UserController, { lifetime: Lifetime.SINGLETON }),
      [CATEGORY_CONTROLLER]: asClass(CategoryController, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_BOOK_CONTROLLER]: asClass(AuthorBookController, { lifetime: Lifetime.SINGLETON }),
      [BOOK_CATEGORY_CONTROLLER]: asClass(BookCategoryController, { lifetime: Lifetime.SINGLETON }),
      [ADDRESS_CONTROLLER]: asClass(AddressController, { lifetime: Lifetime.SINGLETON }),
      [CUSTOMER_CONTROLLER]: asClass(CustomerController, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
