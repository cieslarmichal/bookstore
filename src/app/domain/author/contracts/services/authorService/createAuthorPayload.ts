import { CreateAuthorDraft } from './createAuthorDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface CreateAuthorPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: CreateAuthorDraft;
}
