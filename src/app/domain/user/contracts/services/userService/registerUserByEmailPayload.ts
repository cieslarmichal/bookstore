import { RegisterUserByEmailDraft } from './registerUserByEmailDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface RegisterUserByEmailPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: RegisterUserByEmailDraft;
}
