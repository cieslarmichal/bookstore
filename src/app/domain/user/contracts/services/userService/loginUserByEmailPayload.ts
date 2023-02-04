import { LoginUserByEmailDraft } from './loginUserByEmailDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface LoginUserByEmailPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: LoginUserByEmailDraft;
}
