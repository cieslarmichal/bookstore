import { LoggerService } from '../../../../../libs/logger/contracts/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/implementations/uuidGenerator';
import { Book } from '../../../contracts/book';
import { BookRepositoryFactory } from '../../../contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookService } from '../../../contracts/services/bookService/bookService';
import { CreateBookPayload } from '../../../contracts/services/bookService/createBookPayload';
import { DeleteBookPayload } from '../../../contracts/services/bookService/deleteBookPayload';
import { FindBookPayload } from '../../../contracts/services/bookService/findBookPayload';
import { FindBooksByAuthorIdPayload } from '../../../contracts/services/bookService/findBooksByAuthorIdPayload';
import { FindBooksByCategoryIdPayload } from '../../../contracts/services/bookService/findBooksByCategoryIdPayload';
import { FindBooksPayload } from '../../../contracts/services/bookService/findBooksPayload';
import { UpdateBookPayload } from '../../../contracts/services/bookService/updateBookPayload';
import { BookNotFoundError } from '../../../errors/bookNotFoundError';

export class BookServiceImpl implements BookService {
  public constructor(
    private readonly bookRepositoryFactory: BookRepositoryFactory,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBook(input: CreateBookPayload): Promise<Book> {
    const { unitOfWork, draft } = input;

    this.loggerService.debug({ message: 'Creating book...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.createOne({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Book created.', context: { bookId: book.id } });

    return book;
  }

  public async findBook(input: FindBookPayload): Promise<Book> {
    const { unitOfWork, bookId } = input;

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.findOne({ id: bookId });

    if (!book) {
      throw new BookNotFoundError({ id: bookId });
    }

    return book;
  }

  public async findBooks(input: FindBooksPayload): Promise<Book[]> {
    const { unitOfWork, filters, pagination } = input;

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findMany({ filters, pagination });

    return books;
  }

  public async findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]> {
    const { unitOfWork, authorId, filters, pagination } = input;

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findMany({ authorId, filters, pagination });

    return books;
  }

  public async findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]> {
    const { unitOfWork, categoryId, filters, pagination } = input;

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const books = await bookRepository.findMany({ categoryId, filters, pagination });

    return books;
  }

  public async updateBook(input: UpdateBookPayload): Promise<Book> {
    const { unitOfWork, bookId, draft } = input;

    this.loggerService.debug({ message: 'Updating book...', context: { bookId, ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    const book = await bookRepository.updateOne({ id: bookId, draft });

    this.loggerService.info({ message: 'Book updated.', context: { bookId } });

    return book;
  }

  public async deleteBook(input: DeleteBookPayload): Promise<void> {
    const { unitOfWork, bookId } = input;

    this.loggerService.debug({ message: 'Deleting book...', context: { bookId } });

    const entityManager = unitOfWork.getEntityManager();

    const bookRepository = this.bookRepositoryFactory.create(entityManager);

    await bookRepository.deleteOne({ id: bookId });

    this.loggerService.info({ message: 'Book deleted.', context: { bookId } });
  }
}
