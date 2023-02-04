import { UpdateBookDraft } from './updateBookDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface UpdateBookPayload {
  readonly unitOfWork: UnitOfWork;
  readonly bookId: string;
  readonly draft: UpdateBookDraft;
}
