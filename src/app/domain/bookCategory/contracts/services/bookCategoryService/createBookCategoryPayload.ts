import { CreateBookCategoryDraft } from './createBookCategoryDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface CreateBookCategoryPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: CreateBookCategoryDraft;
}
