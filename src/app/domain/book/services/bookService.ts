import { Filter, LoggerService, PostgresUnitOfWork } from '../../../common';
import { PaginationData } from '../../common';
import { BookDto } from '../dtos';
import { BookNotFound } from '../errors';
import { BookRepositoryFactory } from '../repositories/bookRepositoryFactory';
import { CreateBookData, UpdateBookData } from './types';

export class BookService {
  public constructor(
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBook(unitOfWork: PostgresUnitOfWork, bookData: CreateBookData): Promise<BookDto> {
    this.loggerService.debug('Creating book...');

    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.createOne(bookData);

    this.loggerService.info('Book created.', { bookId: book.id });

    return book;
  }

  public async findBook(unitOfWork: PostgresUnitOfWork, bookId: string): Promise<BookDto> {
    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.findOneById(bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    return book;
  }

  public async findBooks(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findMany(filters, paginationData);

    return books;
  }

  public async findBooksByAuthorId(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findManyByAuthorId(authorId, filters, paginationData);

    return books;
  }

  public async findBooksByCategoryId(
    unitOfWork: PostgresUnitOfWork,
    categoryId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findManyByCategoryId(categoryId, filters, paginationData);

    return books;
  }

  public async updateBook(unitOfWork: PostgresUnitOfWork, bookId: string, bookData: UpdateBookData): Promise<BookDto> {
    this.loggerService.debug('Updating book...', { bookId });

    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.updateOne(bookId, bookData);

    this.loggerService.info('Book updated.', { bookId });

    return book;
  }

  public async removeBook(unitOfWork: PostgresUnitOfWork, bookId: string): Promise<void> {
    this.loggerService.debug('Removing book...', { bookId });

    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    await bookRepository.removeOne(bookId);

    this.loggerService.info('Book removed.', { bookId });
  }
}
