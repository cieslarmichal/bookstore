import { BookDto } from '../dtos';
import { CreateBookData, UpdateBookData } from './types';

export class BookService {
  async createBook(bookData: CreateBookData): Promise<BookDto> {
    console.log('Creating book...');

    console.log('Book created.');

    return new BookDto();
  }

  async findBook(bookId: string): Promise<BookDto> {
    return new BookDto();
  }

  async updateBook(bookId: string, bookData: UpdateBookData): Promise<BookDto> {
    console.log(`Updating book with id ${bookId}...`);

    console.log(`Book with id ${bookId} updated.`);

    return new BookDto();
  }

  async removeBook(bookId: string): Promise<void> {
    console.log(`Removing book with id ${bookId}...`);

    console.log(`Book with id ${bookId} removed.`);
  }
}
