import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

type UserAlreadyExistsEmailContext = {
  readonly email: string;
};

type UserAlreadyExistsPhoneNumberContext = {
  readonly phoneNumber: string;
};

export class UserAlreadyExistsError extends ApplicationError<
  UserAlreadyExistsEmailContext | UserAlreadyExistsPhoneNumberContext
> {
  public constructor(context: UserAlreadyExistsEmailContext | UserAlreadyExistsPhoneNumberContext) {
    super('UserAlreadyExistsError', 'User already exists.', context);
  }
}
