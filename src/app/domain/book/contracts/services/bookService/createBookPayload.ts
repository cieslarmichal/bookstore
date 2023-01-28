import { CreateBookDraft } from './createBookDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface CreateBookPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: CreateBookDraft;
}
