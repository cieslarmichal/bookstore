import { Service } from 'typedi';
import { BookDto } from '../dtos';
import { BookRepository } from '../repositories/bookRepository';
import { CreateBookData, UpdateBookData } from './types';

@Service()
export class BookService {
  public constructor(private readonly bookRepository: BookRepository) {}

  public async createBook(bookData: CreateBookData): Promise<BookDto> {
    console.log('Creating book...');

    console.log('Book created.');

    return new BookDto();
  }

  public async findBook(bookId: string): Promise<BookDto> {
    return new BookDto();
  }

  public async updateBook(
    bookId: string,
    bookData: UpdateBookData,
  ): Promise<BookDto> {
    console.log(`Updating book with id ${bookId}...`);

    console.log(`Book with id ${bookId} updated.`);

    return new BookDto();
  }

  public async removeBook(bookId: string): Promise<void> {
    console.log(`Removing book with id ${bookId}...`);

    console.log(`Book with id ${bookId} removed.`);
  }
}
