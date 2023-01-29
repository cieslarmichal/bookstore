import { LoggerService } from '../../../../../libs/logger/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Author } from '../../../../author/contracts/author';
import { AuthorService } from '../../../../author/contracts/services/authorService/authorService';
import { AuthorNotFoundError } from '../../../../author/errors/authorNotFoundError';
import { Book } from '../../../../book/contracts/book';
import { BookService } from '../../../../book/contracts/services/bookService/bookService';
import { BookNotFoundError } from '../../../../book/errors/bookNotFoundError';
import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookService } from '../../../contracts/services/authorBookService/authorBookService';
import { CreateAuthorBookPayload } from '../../../contracts/services/authorBookService/createAuthorBookPayload';
import { DeleteAuthorBookPayload } from '../../../contracts/services/authorBookService/deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload } from '../../../contracts/services/authorBookService/findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload } from '../../../contracts/services/authorBookService/findBooksByAuthorIdPayload';
import { AuthorBookAlreadyExistsError } from '../../../errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../errors/authorBookNotFoundError';

export class AuthorBookServiceImpl implements AuthorBookService {
  public constructor(
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    private readonly authorService: AuthorService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook> {
    const {
      unitOfWork,
      draft: { authorId, bookId },
    } = input;

    this.loggerService.debug('Creating authorBook...', { authorId, bookId });

    const author = await this.authorService.findAuthor({ unitOfWork, authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const { entityManager } = unitOfWork;

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const existingAuthorBook = await authorBookRepository.findOne({ authorId, bookId });

    if (existingAuthorBook) {
      throw new AuthorBookAlreadyExistsError({ authorId, bookId });
    }

    const authorBook = await authorBookRepository.createOne({ id: UuidGenerator.generateUuid(), authorId, bookId });

    this.loggerService.info('AuthorBook created.', { authorBookId: authorBook.id });

    return authorBook;
  }

  public async findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]> {
    const { unitOfWork, authorId, filters, pagination } = input;

    const author = await this.authorService.findAuthor({ unitOfWork, authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    return this.bookService.findBooksByAuthorId({ unitOfWork, authorId, filters, pagination });
  }

  public async findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]> {
    const { unitOfWork, bookId, filters, pagination } = input;

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return this.authorService.findAuthorsByBookId({ unitOfWork, bookId, filters, pagination });
  }

  public async deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void> {
    const { unitOfWork, authorId, bookId } = input;

    this.loggerService.debug('Deleting authorBook...', { authorId, bookId });

    const { entityManager } = unitOfWork;

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const authorBook = await authorBookRepository.findOne({ authorId, bookId });

    if (!authorBook) {
      throw new AuthorBookNotFoundError({ authorId, bookId });
    }

    await authorBookRepository.deleteOne({ id: authorBook.id });

    this.loggerService.info('AuthorBook deleted.', { authorBookId: authorBook.id });
  }
}
