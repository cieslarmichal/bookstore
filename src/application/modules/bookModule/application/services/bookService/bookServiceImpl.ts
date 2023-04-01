import { BookService } from './bookService';
import { CreateBookPayload, createBookPayloadSchema } from './payloads/createBookPayload';
import { DeleteBookPayload, deleteBookPayloadSchema } from './payloads/deleteBookPayload';
import { FindBookPayload, findBookPayloadSchema } from './payloads/findBookPayload';
import { FindBooksByAuthorIdPayload, findBooksByAuthorIdPayloadSchema } from './payloads/findBooksByAuthorIdPayload';
import {
  FindBooksByCategoryIdPayload,
  findBooksByCategoryIdPayloadSchema,
} from './payloads/findBooksByCategoryIdPayload';
import { FindBooksPayload, findBooksPayloadSchema } from './payloads/findBooksPayload';
import { UpdateBookPayload, updateBookPayloadSchema } from './payloads/updateBookPayload';
import { Validator } from '../../../../../../libs/validator/validator';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { bookModuleSymbols } from '../../../bookModuleSymbols';
import { Book } from '../../../domain/entities/book/book';
import { BookNotFoundError } from '../../../infrastructure/errors/bookNotFoundError';
import { BookRepositoryFactory } from '../../repositories/bookRepository/bookRepositoryFactory';

@Injectable()
export class BookServiceImpl implements BookService {
  public constructor(
    @Inject(bookModuleSymbols.bookRepositoryFactory)
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
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
