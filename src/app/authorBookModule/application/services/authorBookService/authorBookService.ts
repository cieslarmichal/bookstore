import { CreateAuthorBookPayload } from './payloads/createAuthorBookPayload';
import { DeleteAuthorBookPayload } from './payloads/deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload } from './payloads/findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload } from './payloads/findBooksByAuthorIdPayload';
import { Author } from '../../../../authorModule/domain/entities/author/author';
import { Book } from '../../../../domain/book/contracts/book';
import { AuthorBook } from '../../../domain/entities/authorBook/authorBook';

export interface AuthorBookService {
  createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook>;
  findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]>;
  findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]>;
  deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void>;
}
