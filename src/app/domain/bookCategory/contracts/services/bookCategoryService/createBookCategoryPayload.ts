import { CreateBookCategoryDraft } from './createBookCategoryDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface CreateBookCategoryPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: CreateBookCategoryDraft;
}
