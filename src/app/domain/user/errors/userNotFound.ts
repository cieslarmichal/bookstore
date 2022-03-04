import { DomainError } from '../../shared/domainError';

type UserNotFoundIdContext = {
  readonly id: string;
};

type UserNotFoundEmailContext = {
  readonly email: string;
};

export class UserNotFound extends DomainError<UserNotFoundIdContext | UserNotFoundEmailContext> {
  public constructor(context: UserNotFoundIdContext | UserNotFoundEmailContext) {
    super('User not found.', context);
  }
}
