import { asClass, AwilixContainer } from 'awilix';
import { LoadableModule } from '../shared';
import { BookController } from './book/bookController';
import { BOOK_CONTROLLER } from './controllersInjectionSymbols';

export class ControllersModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [BOOK_CONTROLLER]: asClass(BookController),
    });
  }
}
