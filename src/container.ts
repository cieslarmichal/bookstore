import { createContainer, InjectionMode, asClass, asValue } from 'awilix';
import { BookController } from './app/controllers/book/bookController';
import { BookMapper } from './app/domain/book/mappers/bookMapper';
import { BookRepository } from './app/domain/book/repositories/bookRepository';
import { BookService } from './app/domain/book/services/bookService';
import { createDbConnection } from './app/shared';

export async function createDependencyInjectionContainer() {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY,
  });

  const dbConnection = await createDbConnection();

  const DITokens = {
    entityManager: 'entityManager',
    bookMapper: 'bookMapper',
    bookRepository: 'bookRepository',
    bookService: 'bookService',
    bookController: 'bookController',
  };
  container.register({
    [DITokens.entityManager]: asValue(dbConnection.manager),
    [DITokens.bookMapper]: asClass(BookMapper),
    [DITokens.bookRepository]: asClass(BookRepository),
    [DITokens.bookService]: asClass(BookService),
    [DITokens.bookController]: asClass(BookController),
  });

  return container;
}
