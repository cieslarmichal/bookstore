import { CreateAuthorBookPayload } from './payloads/createAuthorBookPayload';
import { DeleteAuthorBookPayload } from './payloads/deleteAuthorBookPayload';
import { FindAuthorBookPayload } from './payloads/findAuthorBookPayload';
import { AuthorBook } from '../../../domain/entities/authorBook/authorBook';

export interface AuthorBookRepository {
  createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook>;
  findAuthorBook(input: FindAuthorBookPayload): Promise<AuthorBook | null>;
  deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void>;
}
