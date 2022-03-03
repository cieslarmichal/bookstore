import { DomainError } from '../../shared/domainError';

type UserNotFoundContext = {
  readonly id: string;
};

export class UserNotFound extends DomainError<UserNotFoundContext> {
  public constructor(context: UserNotFoundContext) {
    super('User not found.', context);
  }
}
