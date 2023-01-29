import { RegisterUserByPhoneNumberDraft } from './registerUserByPhoneNumberDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface RegisterUserByPhoneNumberPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: RegisterUserByPhoneNumberDraft;
}
