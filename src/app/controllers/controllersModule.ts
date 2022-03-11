import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../shared';
import { AuthorController } from './author/authorController';
import { BookController } from './book/bookController';
import { CategoryController } from './category/categoryController';
import {
  AUTHOR_CONTROLLER,
  AUTH_MIDDLEWARE,
  AUTH_SERVICE,
  BOOK_CONTROLLER,
  CATEGORY_CONTROLLER,
  USER_CONTROLLER,
} from './controllersInjectionSymbols';
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
    });
  }
}
