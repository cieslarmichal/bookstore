import { asClass, AwilixContainer } from 'awilix';
import { LoadableModule } from '../shared';
import { AuthorController } from './author/authorController';
import { BookController } from './book/bookController';
import { AUTHOR_CONTROLLER, BOOK_CONTROLLER, USER_CONTROLLER } from './controllersInjectionSymbols';
import { UserController } from './user/userController';

export class ControllersModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [BOOK_CONTROLLER]: asClass(BookController),
      [AUTHOR_CONTROLLER]: asClass(AuthorController),
      [USER_CONTROLLER]: asClass(UserController),
    });
  }
}
