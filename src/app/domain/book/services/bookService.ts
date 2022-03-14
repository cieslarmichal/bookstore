import { LoggerService } from '../../../shared/logger/services/loggerService';
import { BookDto } from '../dtos';
import { BookNotFound } from '../errors';
import { BookRepository } from '../repositories/bookRepository';
import { CreateBookData, UpdateBookData } from './types';

export class BookService {
  public constructor(private readonly bookRepository: BookRepository, private readonly loggerService: LoggerService) {}

  public async createBook(bookData: CreateBookData): Promise<BookDto> {
    this.loggerService.debug('Creating book...');

    const book = await this.bookRepository.createOne(bookData);

    this.loggerService.info('Book created.', { bookId: book.id });

    return book;
  }

  public async findBook(bookId: string): Promise<BookDto> {
    const book = await this.bookRepository.findOneById(bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    return book;
  }

  public async findBooks(authorId: string): Promise<BookDto[]> {
    const books = await this.bookRepository.findManyByAuthorId(authorId);

    return books;
  }

  public async updateBook(bookId: string, bookData: UpdateBookData): Promise<BookDto> {
    this.loggerService.debug('Updating book...', { bookId });

    const book = await this.bookRepository.updateOne(bookId, bookData);

    this.loggerService.info('Book updated.', { bookId });

    return book;
  }

  public async removeBook(bookId: string): Promise<void> {
    this.loggerService.debug('Removing book...', { bookId });

    await this.bookRepository.removeOne(bookId);

    this.loggerService.info('Book removed.', { bookId });
  }
}
