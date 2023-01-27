import { Filter } from '../../../../../common/filter/filter';
import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Book } from '../../../contracts/book';
import { BookRepositoryFactory } from '../../../contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookService } from '../../../contracts/services/bookService/bookService';
import { CreateBookData } from '../../../contracts/services/bookService/createBookData';
import { UpdateBookData } from '../../../contracts/services/bookService/updateBookData';
import { BookNotFoundError } from '../../../errors/bookNotFoundError';

export class BookServiceImpl implements BookService {
  public constructor(
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBook(unitOfWork: PostgresUnitOfWork, bookData: CreateBookData): Promise<Book> {
    this.loggerService.debug('Creating book...');

    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.createOne(bookData);

    this.loggerService.info('Book created.', { bookId: book.id });

    return book;
  }

  public async findBook(unitOfWork: PostgresUnitOfWork, bookId: string): Promise<Book> {
    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.findOne(bookId);

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return book;
  }

  public async findBooks(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Book[]> {
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
  ): Promise<Book[]> {
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
  ): Promise<Book[]> {
    const { entityManager } = unitOfWork;

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findManyByCategoryId(categoryId, filters, paginationData);

    return books;
  }

  public async updateBook(unitOfWork: PostgresUnitOfWork, bookId: string, bookData: UpdateBookData): Promise<Book> {
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

    await bookRepository.deleteOne(bookId);

    this.loggerService.info('Book removed.', { bookId });
  }
}
