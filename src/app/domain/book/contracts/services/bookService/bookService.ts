import { CreateBookPayload } from './createBookPayload';
import { DeleteBookPayload } from './deleteBookPayload';
import { FindBookPayload } from './findBookPayload';
import { FindBooksByAuthorIdPayload } from './findBooksByAuthorIdPayload';
import { FindBooksByCategoryIdPayload } from './findBooksByCategoryIdPayload';
import { FindBooksPayload } from './findBooksPayload';
import { UpdateBookPayload } from './updateBookPayload';
import { Book } from '../../book';

export interface BookService {
  createBook(input: CreateBookPayload): Promise<Book>;
  findBook(input: FindBookPayload): Promise<Book>;
  findBooks(input: FindBooksPayload): Promise<Book[]>;
  findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]>;
  findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]>;
  updateBook(input: UpdateBookPayload): Promise<Book>;
  deleteBook(input: DeleteBookPayload): Promise<void>;
}
