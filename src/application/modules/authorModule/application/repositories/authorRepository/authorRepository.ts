import { CreateAuthorPayload } from './payloads/createAuthorPayload';
import { DeleteAuthorPayload } from './payloads/deleteAuthorPayload';
import { FindAuthorPayload } from './payloads/findAuthorPayload';
import { FindAuthorsPayload } from './payloads/findAuthorsPayload';
import { UpdateAuthorPayload } from './payloads/updateAuthorPayload';
import { Author } from '../../../domain/entities/author/author';

export interface AuthorRepository {
  createAuthor(input: CreateAuthorPayload): Promise<Author>;
  findAuthor(input: FindAuthorPayload): Promise<Author | null>;
  findAuthors(input: FindAuthorsPayload): Promise<Author[]>;
  updateAuthor(input: UpdateAuthorPayload): Promise<Author>;
  deleteAuthor(input: DeleteAuthorPayload): Promise<void>;
}
