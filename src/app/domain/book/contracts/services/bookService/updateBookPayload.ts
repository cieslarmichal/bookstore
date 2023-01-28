import { UpdateBookDraft } from './updateBookDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface UpdateBookPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly bookId: string;
  readonly draft: UpdateBookDraft;
}
