import { LoggerService } from '../../../shared/logger/services/loggerService';
import { AuthorDto } from '../../author/dtos';
import { AuthorNotFound } from '../../author/errors';
import { AuthorService } from '../../author/services/authorService';
import { BookDto } from '../../book/dtos';
import { BookNotFound } from '../../book/errors';
import { BookService } from '../../book/services/bookService';
import { AuthorBookDto } from '../dtos';
import { AuthorBookAlreadyExists, AuthorBookNotFound } from '../errors';
import { AuthorBookRepository } from '../repositories/authorBookRepository';
import { CreateAuthorBookData, RemoveAuthorBookData } from './types';

export class AuthorBookService {
  public constructor(
    private readonly authorBookRepository: AuthorBookRepository,
    private readonly authorService: AuthorService,
    private readonly bookService: BookService,
    private readonly loggerService: LoggerService,
  ) {}

  public async createAuthorBook(authorBookData: CreateAuthorBookData): Promise<AuthorBookDto> {
    const { authorId, bookId } = authorBookData;

    this.loggerService.debug('Creating authorBook...', { authorId, bookId });

    const author = await this.authorService.findAuthor(authorId);

    if (!author) {
      throw new AuthorBookNotFound({ id: authorId });
    }

    const book = await this.bookService.findBook(bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    const existingAuthorBook = await this.authorBookRepository.findOne({ authorId, bookId });

    if (existingAuthorBook) {
      throw new AuthorBookAlreadyExists({ authorId, bookId });
    }

    const authorBook = await this.authorBookRepository.createOne(authorBookData);

    this.loggerService.info('AuthorBook created.', { authorBookId: authorBook.id });

    return authorBook;
  }

  public async findAuthorBooks(authorId: string): Promise<BookDto[]> {
    const author = await this.authorService.findAuthor(authorId);

    if (!author) {
      throw new AuthorNotFound({ id: authorId });
    }

    return this.bookService.findBooksByAuthorId(authorId);
  }

  public async findBookAuthors(bookId: string): Promise<AuthorDto[]> {
    const book = await this.bookService.findBook(bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    return this.authorService.findAuthorsByBookId(bookId);
  }

  public async removeAuthorBook(authorBookData: RemoveAuthorBookData): Promise<void> {
    const { authorId, bookId } = authorBookData;

    this.loggerService.debug('Removing authorBook...', { authorId, bookId });

    const authorBook = await this.authorBookRepository.findOne({ authorId, bookId });

    if (!authorBook) {
      throw new AuthorBookNotFound({ authorId, bookId });
    }

    await this.authorBookRepository.removeOne(authorBook.id);

    this.loggerService.info(`AuthorBook removed.`, { authorBookId: authorBook.id });
  }
}
