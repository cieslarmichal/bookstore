import { CreateAuthorBookDraft } from './createAuthorBookDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface CreateAuthorBookPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: CreateAuthorBookDraft;
}
