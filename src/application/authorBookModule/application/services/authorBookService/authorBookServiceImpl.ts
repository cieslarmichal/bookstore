import { AuthorBookService } from './authorBookService';
import { CreateAuthorBookPayload, createAuthorBookPayloadSchema } from './payloads/createAuthorBookPayload';
import { DeleteAuthorBookPayload, deleteAuthorBookPayloadSchema } from './payloads/deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload, findAuthorsByBookIdPayloadSchema } from './payloads/findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload, findBooksByAuthorIdPayloadSchema } from './payloads/findBooksByAuthorIdPayload';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../libs/validator/validator';
import { AuthorService } from '../../../../authorModule/application/services/authorService/authorService';
import { authorModuleSymbols } from '../../../../authorModule/authorModuleSymbols';
import { Author } from '../../../../authorModule/domain/entities/author/author';
import { AuthorNotFoundError } from '../../../../authorModule/infrastructure/errors/authorNotFoundError';
import { BookService } from '../../../../bookModule/application/services/bookService/bookService';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { Book } from '../../../../bookModule/domain/entities/book/book';
import { BookNotFoundError } from '../../../../bookModule/infrastructure/errors/bookNotFoundError';
import { AuthorBookRepositoryFactory } from '../../../application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { authorBookModuleSymbols } from '../../../authorBookModuleSymbols';
import { AuthorBook } from '../../../domain/entities/authorBook/authorBook';
import { AuthorBookAlreadyExistsError } from '../../../infrastructure/errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../infrastructure/errors/authorBookNotFoundError';

@Injectable()
export class AuthorBookServiceImpl implements AuthorBookService {
  public constructor(
    @Inject(authorBookModuleSymbols.authorBookRepositoryFactory)
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    @Inject(authorModuleSymbols.authorService)
    private readonly authorService: AuthorService,
    @Inject(bookModuleSymbols.bookService)
    private readonly bookService: BookService,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook> {
    const {
      unitOfWork,
      draft: { authorId, bookId },
    } = Validator.validate(createAuthorBookPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating authorBook...', context: { authorId, bookId } });

    const author = await this.authorService.findAuthor({ unitOfWork, authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    const entityManager = unitOfWork.getEntityManager();

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const existingAuthorBook = await authorBookRepository.findOne({ authorId, bookId });

    if (existingAuthorBook) {
      throw new AuthorBookAlreadyExistsError({ authorId, bookId });
    }

    const authorBook = await authorBookRepository.createOne({ id: UuidGenerator.generateUuid(), authorId, bookId });

    this.loggerService.info({ message: 'AuthorBook created.', context: { authorBookId: authorBook.id } });

    return authorBook;
  }

  public async findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]> {
    const { unitOfWork, authorId, filters, pagination } = Validator.validate(findBooksByAuthorIdPayloadSchema, input);

    const author = await this.authorService.findAuthor({ unitOfWork, authorId });

    if (!author) {
      throw new AuthorNotFoundError({ id: authorId });
    }

    return this.bookService.findBooksByAuthorId({ unitOfWork, authorId, filters, pagination });
  }

  public async findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]> {
    const { unitOfWork, bookId, filters, pagination } = Validator.validate(findAuthorsByBookIdPayloadSchema, input);

    const book = await this.bookService.findBook({ unitOfWork, bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return this.authorService.findAuthorsByBookId({ unitOfWork, bookId, filters, pagination });
  }

  public async deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void> {
    const { unitOfWork, authorId, bookId } = Validator.validate(deleteAuthorBookPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting authorBook...', context: { authorId, bookId } });

    const entityManager = unitOfWork.getEntityManager();

    const authorBookRepository = this.authorBookRepositoryFactory.create(entityManager);

    const authorBook = await authorBookRepository.findOne({ authorId, bookId });

    if (!authorBook) {
      throw new AuthorBookNotFoundError({ authorId, bookId });
    }

    await authorBookRepository.deleteOne({ id: authorBook.id });

    this.loggerService.info({ message: 'AuthorBook deleted.', context: { authorBookId: authorBook.id } });
  }
}
