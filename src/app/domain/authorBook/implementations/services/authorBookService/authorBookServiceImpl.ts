import { Filter } from '../../../../../common/filter/filter';
import { LoggerService } from '../../../../../libs/logger/services/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Author } from '../../../../author/contracts/author';
import { AuthorService } from '../../../../author/contracts/services/authorService/authorService';
import { AuthorNotFound } from '../../../../author/errors/authorNotFound';
import { BookDto } from '../../../../book/dtos';
import { BookNotFound } from '../../../../book/errors';
import { BookService } from '../../../../book/services/bookService';
import { PaginationData } from '../../../../common/paginationData';
import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookService } from '../../../contracts/services/authorBookService/authorBookService';
import { CreateAuthorBookData } from '../../../contracts/services/authorBookService/createAuthorBookData';
import { RemoveAuthorBookData } from '../../../contracts/services/authorBookService/removeAuthorBookData';
import { AuthorBookAlreadyExists } from '../../../errors/authorBookAlreadyExists';
import { AuthorBookNotFound } from '../../../errors/authorBookNotFound';

export class AuthorBookServiceImpl implements AuthorBookService {
  public constructor(
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    private readonly authorService: AuthorService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthorBook(
    unitOfWork: PostgresUnitOfWork,
    authorBookData: CreateAuthorBookData,
  ): Promise<AuthorBook> {
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
  ): Promise<Author[]> {
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
