import { CreateBookDraft } from './createBookDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface CreateBookPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: CreateBookDraft;
}
