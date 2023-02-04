import { CreateCategoryDraft } from './createCategoryDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface CreateCategoryPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: CreateCategoryDraft;
}
