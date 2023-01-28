import { UpdateAuthorDraft } from './updateAuthorDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface UpdateAuthorPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly authorId: string;
  readonly draft: UpdateAuthorDraft;
}
