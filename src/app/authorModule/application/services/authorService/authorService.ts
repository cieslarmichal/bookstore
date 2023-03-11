import { CreateAuthorPayload } from './payloads/createAuthorPayload';
import { DeleteAuthorPayload } from './payloads/deleteAuthorPayload';
import { FindAuthorPayload } from './payloads/findAuthorPayload';
import { FindAuthorsByBookIdPayload } from './payloads/findAuthorsByBookIdPayload';
import { FindAuthorsPayload } from './payloads/findAuthorsPayload';
import { UpdateAuthorPayload } from './payloads/updateAuthorPayload';
import { Author } from '../../../domain/entities/author/author';

export interface AuthorService {
  createAuthor(input: CreateAuthorPayload): Promise<Author>;
  findAuthor(input: FindAuthorPayload): Promise<Author>;
  findAuthors(input: FindAuthorsPayload): Promise<Author[]>;
  findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]>;
  updateAuthor(input: UpdateAuthorPayload): Promise<Author>;
  deleteAuthor(input: DeleteAuthorPayload): Promise<void>;
}
