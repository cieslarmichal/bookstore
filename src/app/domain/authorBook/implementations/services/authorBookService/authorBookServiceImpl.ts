import { Filter } from '../../../../../common/filter/filter';
import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Author } from '../../../../author/contracts/author';
import { AuthorService } from '../../../../author/contracts/services/authorService/authorService';
import { AuthorNotFoundError } from '../../../../author/errors/authorNotFoundError';
import { Book } from '../../../../book/contracts/book';
import { BookService } from '../../../../book/contracts/services/bookService/bookService';
import { BookNotFoundError } from '../../../../book/errors/bookNotFoundError';
import { PaginationData } from '../../../../common/paginationData';
import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookService } from '../../../contracts/services/authorBookService/authorBookService';
import { CreateAuthorBookData } from '../../../contracts/services/authorBookService/createAuthorBookData';
import { RemoveAuthorBookData } from '../../../contracts/services/authorBookService/removeAuthorBookData';
import { AuthorBookAlreadyExistsError } from '../../../errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../errors/authorBookNotFoundError';

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
      throw new AuthorNotFoundError({ id: authorId });
    }

    const book = await this.bookService.findBook(unitOfWork, bookId);

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const { entityManager } = unitOfWork;

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const existingAuthorBook = await authorBookRepository.findOne({ authorId, bookId });

    if (existingAuthorBook) {
      throw new AuthorBookAlreadyExistsError({ authorId, bookId });
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
  ): Promise<Book[]> {
    const author = await this.authorService.findAuthor(unitOfWork, authorId);

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
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
      throw new BookNotFoundError({ id: bookId });
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
      throw new AuthorBookNotFoundError({ authorId, bookId });
    }

    await authorBookRepository.deleteOne(authorBook.id);

    this.loggerService.info(`AuthorBook removed.`, { authorBookId: authorBook.id });
  }
}
