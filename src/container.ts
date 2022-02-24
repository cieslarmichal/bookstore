import awilix from 'awilix';
import { BookController } from './app/controllers/book/bookController';
import { BookMapper } from './app/domain/book/mappers/bookMapper';
import { BookRepository } from './app/domain/book/repositories/bookRepository';
import { BookService } from './app/domain/book/services/bookService';
import { createDbConnection } from './app/shared';

export async function createContainer() {
  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  const dbConnection = await createDbConnection();

  container.register({
    entityManager: awilix.asValue(dbConnection.manager),
    bookMapper: awilix.asClass(BookMapper),
    bookRepository: awilix.asClass(BookRepository),
    bookService: awilix.asClass(BookService),
    bookController: awilix.asClass(BookController),
  });
}
