import { RegisterUserByEmailDraft } from './registerUserByEmailDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface RegisterUserByEmailPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: RegisterUserByEmailDraft;
}
