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
  ) {}

  public async createAuthorBook(authorBookData: CreateAuthorBookData): Promise<AuthorBookDto> {
    console.log('Creating authorBook...');

    const { authorId, bookId } = authorBookData;

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

    console.log('AuthorBook created.');

    return authorBook;
  }

  public async findAuthorBooks(authorId: string): Promise<BookDto[]> {
    const author = await this.authorService.findAuthor(authorId);

    if (!author) {
      throw new AuthorNotFound({ id: authorId });
    }

    return this.bookService.findBooks(authorId);
  }

  public async findBookAuthors(bookId: string): Promise<AuthorDto[]> {
    const book = await this.bookService.findBook(bookId);

    if (!book) {
      throw new BookNotFound({ id: bookId });
    }

    return this.authorService.findAuthors(bookId);
  }

  public async removeAuthorBook(authorBookData: RemoveAuthorBookData): Promise<void> {
    console.log(`Removing authorBook...`);

    const { authorId, bookId } = authorBookData;

    const authorBook = await this.authorBookRepository.findOne({ authorId, bookId });

    if (!authorBook) {
      throw new AuthorBookNotFound({ authorId, bookId });
    }

    await this.authorBookRepository.removeOne(authorBook.id);

    console.log(`AuthorBook removed.`);
  }
}
