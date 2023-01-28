import { CreateAuthorDraft } from './createAuthorDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface CreateAuthorPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: CreateAuthorDraft;
}
