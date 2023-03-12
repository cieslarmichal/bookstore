import { CreateBookPayload } from './payloads/createBookPayload';
import { DeleteBookPayload } from './payloads/deleteBookPayload';
import { FindBookPayload } from './payloads/findBookPayload';
import { FindBooksByAuthorIdPayload } from './payloads/findBooksByAuthorIdPayload';
import { FindBooksByCategoryIdPayload } from './payloads/findBooksByCategoryIdPayload';
import { FindBooksPayload } from './payloads/findBooksPayload';
import { UpdateBookPayload } from './payloads/updateBookPayload';
import { Book } from '../../../domain/entities/book/book';

export interface BookService {
  createBook(input: CreateBookPayload): Promise<Book>;
  findBook(input: FindBookPayload): Promise<Book>;
  findBooks(input: FindBooksPayload): Promise<Book[]>;
  findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]>;
  findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]>;
  updateBook(input: UpdateBookPayload): Promise<Book>;
  deleteBook(input: DeleteBookPayload): Promise<void>;
}
