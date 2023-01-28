import { CreateCategoryDraft } from './createCategoryDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface CreateCategoryPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: CreateCategoryDraft;
}
