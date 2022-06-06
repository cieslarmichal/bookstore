import { Filter, LoggerService, PostgresUnitOfWork } from '../../../shared';
import { AuthorDto } from '../../author/dtos';
import { AuthorNotFound } from '../../author/errors';
import { AuthorService } from '../../author/services/authorService';
import { BookDto } from '../../book/dtos';
import { BookNotFound } from '../../book/errors';
import { BookService } from '../../book/services/bookService';
import { PaginationData } from '../../shared';
import { AuthorBookDto } from '../dtos';
import { AuthorBookAlreadyExists, AuthorBookNotFound } from '../errors';
import { AuthorBookRepositoryFactory } from '../repositories/authorBookRepositoryFactory';
import { CreateAuthorBookData, RemoveAuthorBookData } from './types';

export class AuthorBookService {
  public constructor(
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    private readonly authorService: AuthorService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthorBook(
    unitOfWork: PostgresUnitOfWork,
    authorBookData: CreateAuthorBookData,
  ): Promise<AuthorBookDto> {
    const { authorId, bookId } = authorBookData;

    this.loggerService.debug('Creating authorBook...', { authorId, bookId });

    const author = await this.authorService.findAuthor(unitOfWork, authorId);

    if (!author) {
      throw new AuthorNotFound({ id: authorId });
    }

    const book = await this.bookService.findBook(unitOfWork, bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    const { entityManager } = unitOfWork;

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const existingAuthorBook = await authorBookRepository.findOne({ authorId, bookId });

    if (existingAuthorBook) {
      throw new AuthorBookAlreadyExists({ authorId, bookId });
    }

    const authorBook = await authorBookRepository.createOne(authorBookData);

    this.loggerService.info('AuthorBook created.', { authorBookId: authorBook.id });

    return authorBook;
  }

  public async findAuthorBooks(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const author = await this.authorService.findAuthor(unitOfWork, authorId);

    if (!author) {
      throw new AuthorNotFound({ id: authorId });
    }

    return this.bookService.findBooksByAuthorId(unitOfWork, authorId, filters, paginationData);
  }

  public async findBookAuthors(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<AuthorDto[]> {
    const book = await this.bookService.findBook(unitOfWork, bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    return this.authorService.findAuthorsByBookId(unitOfWork, bookId, filters, paginationData);
  }

  public async removeAuthorBook(unitOfWork: PostgresUnitOfWork, authorBookData: RemoveAuthorBookData): Promise<void> {
    const { authorId, bookId } = authorBookData;

    this.loggerService.debug('Removing authorBook...', { authorId, bookId });

    const { entityManager } = unitOfWork;

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const authorBook = await authorBookRepository.findOne({ authorId, bookId });

    if (!authorBook) {
      throw new AuthorBookNotFound({ authorId, bookId });
    }

    await authorBookRepository.removeOne(authorBook.id);

    this.loggerService.info(`AuthorBook removed.`, { authorBookId: authorBook.id });
  }
}
