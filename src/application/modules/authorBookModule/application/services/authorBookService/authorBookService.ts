import { CreateAuthorBookPayload } from './payloads/createAuthorBookPayload';
import { DeleteAuthorBookPayload } from './payloads/deleteAuthorBookPayload';
import { AuthorBook } from '../../../domain/entities/authorBook/authorBook';

export interface AuthorBookService {
  createAuthorBook(input: CreateAuthorBookPayload): Promise<AuthorBook>;
  deleteAuthorBook(input: DeleteAuthorBookPayload): Promise<void>;
}
