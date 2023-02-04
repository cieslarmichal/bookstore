import { UpdateAuthorDraft } from './updateAuthorDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface UpdateAuthorPayload {
  readonly unitOfWork: UnitOfWork;
  readonly authorId: string;
  readonly draft: UpdateAuthorDraft;
}
