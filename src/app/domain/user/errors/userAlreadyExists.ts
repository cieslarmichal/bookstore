import { DomainError } from '../../shared/domainError';

type UserAlreadyExistsContext = {
  readonly email: string;
};

export class UserAlreadyExists extends DomainError<UserAlreadyExistsContext> {
  public constructor(context: UserAlreadyExistsContext) {
    super('User already exists.', context);
  }
}
