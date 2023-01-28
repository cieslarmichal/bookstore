import { CreateAuthorPayload } from './createAuthorPayload';
import { DeleteAuthorPayload } from './deleteAuthorPayload';
import { FindAuthorPayload } from './findAuthorPayload';
import { FindAuthorsByBookIdPayload } from './findAuthorsByBookIdPayload';
import { FindAuthorsPayload } from './findAuthorsPayload';
import { UpdateAuthorPayload } from './updateAuthorPayload';
import { Author } from '../../author';

export interface AuthorService {
  createAuthor(input: CreateAuthorPayload): Promise<Author>;
  findAuthor(input: FindAuthorPayload): Promise<Author>;
  findAuthors(input: FindAuthorsPayload): Promise<Author[]>;
  findAuthorsByBookId(input: FindAuthorsByBookIdPayload): Promise<Author[]>;
  updateAuthor(input: UpdateAuthorPayload): Promise<Author>;
  deleteAuthor(input: DeleteAuthorPayload): Promise<void>;
}
