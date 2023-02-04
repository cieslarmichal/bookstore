import { RegisterUserByPhoneNumberDraft } from './registerUserByPhoneNumberDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/implementations/postgresUnitOfWork';

export interface RegisterUserByPhoneNumberPayload {
  readonly unitOfWork: UnitOfWork;
  readonly draft: RegisterUserByPhoneNumberDraft;
}
