import { CreateBookPayload } from './payloads/createBookPayload';
import { DeleteBookPayload } from './payloads/deleteBookPayload';
import { FindBookPayload } from './payloads/findBookPayload';
import { FindBooksPayload } from './payloads/findBooksPayload';
import { UpdateBookPayload } from './payloads/updateBookPayload';
import { Book } from '../../../domain/entities/book/book';

export interface BookRepository {
  createBook(input: CreateBookPayload): Promise<Book>;
  findBook(input: FindBookPayload): Promise<Book | null>;
  findBooks(input: FindBooksPayload): Promise<Book[]>;
  updateBook(input: UpdateBookPayload): Promise<Book>;
  deleteBook(input: DeleteBookPayload): Promise<void>;
}
