import { CreateAuthorBookPayload } from './createAuthorBookPayload';
import { DeleteAuthorBookPayload } from './deleteAuthorBookPayload';
import { FindAuthorsByBookIdPayload } from './findAuthorsByBookIdPayload';
import { FindBooksByAuthorIdPayload } from './findBooksByAuthorIdPayload';
import { Author } from '../../../../author/contracts/author';
import { Book } from '../../../../book/contracts/book';
import { AuthorBook } from '../../authorBook';

export interface AuthorBookService {
  createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook>;
  findBooksByAuthorId(input: FindBooksByAuthorIdPayload): Promise<Book[]>;
  findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]>;
  deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void>;
}
