import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../libs/logger/loggerSymbols';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { bookSymbols } from '../../../bookSymbols';
import { Book } from '../../../contracts/book';
import { BookRepositoryFactory } from '../../../contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookService } from '../../../contracts/services/bookService/bookService';
import { CreateBookPayload, createBookPayloadSchema } from '../../../contracts/services/bookService/createBookPayload';
import { DeleteBookPayload, deleteBookPayloadSchema } from '../../../contracts/services/bookService/deleteBookPayload';
import { FindBookPayload, findBookPayloadSchema } from '../../../contracts/services/bookService/findBookPayload';
import {
  FindBooksByAuthorIdPayload,
  findBooksByAuthorIdPayloadSchema,
} from '../../../contracts/services/bookService/findBooksByAuthorIdPayload';
import {
  FindBooksByCategoryIdPayload,
  findBooksByCategoryIdPayloadSchema,
} from '../../../contracts/services/bookService/findBooksByCategoryIdPayload';
import { FindBooksPayload, findBooksPayloadSchema } from '../../../contracts/services/bookService/findBooksPayload';
import { UpdateBookPayload, updateBookPayloadSchema } from '../../../contracts/services/bookService/updateBookPayload';
import { BookNotFoundError } from '../../../errors/bookNotFoundError';

@Injectable()
export class BookServiceImpl implements BookService {
  public constructor(
    @Inject(bookSymbols.bookRepositoryFactory)
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async createBook(input: CreateBookPayload): Promise<Book> {
    const { unitOfWork, draft } = Validator.validate(createBookPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating book...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.createOne({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Book created.', context: { bookId: book.id } });

    return book;
  }

  public async findBook(input: FindBookPayload): Promise<Book> {
    const { unitOfWork, bookId } = Validator.validate(findBookPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.findOne({ id: bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return book;
  }

  public async findBooks(input: FindBooksPayload): Promise<Book[]> {
    const { unitOfWork, filters, pagination } = Validator.validate(findBooksPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findMany({ filters, pagination });

    return books;
  }

  public async findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]> {
    const { unitOfWork, authorId, filters, pagination } = Validator.validate(findBooksByAuthorIdPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findMany({ authorId, filters, pagination });

    return books;
  }

  public async findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]> {
    const { unitOfWork, categoryId, filters, pagination } = Validator.validate(
      findBooksByCategoryIdPayloadSchema,
      input,
    );

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findMany({ categoryId, filters, pagination });

    return books;
  }

  public async updateBook(input: UpdateBookPayload): Promise<Book> {
    const { unitOfWork, bookId, draft } = Validator.validate(updateBookPayloadSchema, input);

    this.loggerService.debug({ message: 'Updating book...', context: { bookId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.updateOne({ id: bookId, draft });

    this.loggerService.info({ message: 'Book updated.', context: { bookId } });

    return book;
  }

  public async deleteBook(input: DeleteBookPayload): Promise<void> {
    const { unitOfWork, bookId } = Validator.validate(deleteBookPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting book...', context: { bookId } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    await bookRepository.deleteOne({ id: bookId });

    this.loggerService.info({ message: 'Book deleted.', context: { bookId } });
  }
}
