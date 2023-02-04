import { LoginUserByPhoneNumberDraft } from './loginUserByPhoneNumberDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export interface LoginUserByPhoneNumberPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: LoginUserByPhoneNumberDraft;
}
