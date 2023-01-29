import { LoginUserByEmailDraft } from './loginUserByEmailDraft';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface LoginUserByEmailPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly draft: LoginUserByEmailDraft;
}
