import { CreateAuthorBookDraft } from './createAuthorBookDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface CreateAuthorBookPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: CreateAuthorBookDraft;
}
