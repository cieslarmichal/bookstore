import { DomainError } from '../../../shared/errors/domainError';

type UserNotFoundIdContext = {
  readonly id: string;
};

type UserNotFoundEmailContext = {
  readonly email: string;
};

type UserNotFoundPhoneNumberContext = {
  readonly phoneNumber: string;
};
export class UserNotFound extends DomainError<
  UserNotFoundIdContext | UserNotFoundEmailContext | UserNotFoundPhoneNumberContext
> {
  public constructor(context: UserNotFoundIdContext | UserNotFoundEmailContext | UserNotFoundPhoneNumberContext) {
    super('User not found.', context);
  }
}
