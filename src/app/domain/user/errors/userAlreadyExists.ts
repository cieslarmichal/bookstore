import { DomainError } from '../../../shared/errors/domainError';

type UserAlreadyExistsEmailContext = {
  readonly email: string;
};

type UserAlreadyExistsPhoneNumberContext = {
  readonly phoneNumber: string;
};

export class UserAlreadyExists extends DomainError<
  UserAlreadyExistsEmailContext | UserAlreadyExistsPhoneNumberContext
> {
  public constructor(context: UserAlreadyExistsEmailContext | UserAlreadyExistsPhoneNumberContext) {
    super('User already exists.', context);
  }
}
