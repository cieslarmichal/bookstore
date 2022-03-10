import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../shared';
import { AuthorController } from './author/authorController';
import { BookController } from './book/bookController';
import {
  AUTHOR_CONTROLLER,
  AUTH_MIDDLEWARE,
  AUTH_SERVICE,
  BOOK_CONTROLLER,
  USER_CONTROLLER,
} from './controllersInjectionSymbols';
import { AuthMiddleware } from './shared';
import { AuthService } from './shared';
import { UserController } from './user/userController';

export class ControllersModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [BOOK_CONTROLLER]: asClass(BookController, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_CONTROLLER]: asClass(AuthorController, { lifetime: Lifetime.SINGLETON }),
      [USER_CONTROLLER]: asClass(UserController, { lifetime: Lifetime.SINGLETON }),
      [AUTH_MIDDLEWARE]: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),
      [AUTH_SERVICE]: asClass(AuthService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
