import { LoginUserByPhoneNumberDraft } from './loginUserByPhoneNumberDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface LoginUserByPhoneNumberPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: LoginUserByPhoneNumberDraft;
}
