import { Inject, Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { authorSymbols } from '../../../../author/authorSymbols';
import { Author } from '../../../../author/contracts/author';
import { AuthorService } from '../../../../author/contracts/services/authorService/authorService';
import { AuthorNotFoundError } from '../../../../author/errors/authorNotFoundError';
import { bookSymbols } from '../../../../book/bookSymbols';
import { Book } from '../../../../book/contracts/book';
import { BookService } from '../../../../book/contracts/services/bookService/bookService';
import { BookNotFoundError } from '../../../../book/errors/bookNotFoundError';
import { authorBookSymbols } from '../../../authorBookSymbols';
import { AuthorBook } from '../../../contracts/authorBook';
import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookService } from '../../../contracts/services/authorBookService/authorBookService';
import {
  CreateAuthorBookPayload,
  createAuthorBookPayloadSchema,
} from '../../../contracts/services/authorBookService/createAuthorBookPayload';
import {
  DeleteAuthorBookPayload,
  deleteAuthorBookPayloadSchema,
} from '../../../contracts/services/authorBookService/deleteAuthorBookPayload';
import {
  FindAuthorsByBookIdPayload,
  findAuthorsByBookIdPayloadSchema,
} from '../../../contracts/services/authorBookService/findAuthorsByBookIdPayload';
import {
  FindBooksByAuthorIdPayload,
  findBooksByAuthorIdPayloadSchema,
} from '../../../contracts/services/authorBookService/findBooksByAuthorIdPayload';
import { AuthorBookAlreadyExistsError } from '../../../errors/authorBookAlreadyExistsError';
import { AuthorBookNotFoundError } from '../../../errors/authorBookNotFoundError';

@Injectable()
export class AuthorBookServiceImpl implements AuthorBookService {
  public constructor(
    @Inject(authorBookSymbols.authorBookRepositoryFactory)
    private readonly authorBookRepositoryFactory: AuthorBookRepositoryFactory,
    @Inject(authorSymbols.authorService)
    private readonly authorService: AuthorService,
    @Inject(bookSymbols.bookService)
    private readonly bookService: BookService,
    @Inject(loggerSymbols.loggerService)
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
