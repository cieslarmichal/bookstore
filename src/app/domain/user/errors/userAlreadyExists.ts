import { ApplicationError } from '../../../common/errors/applicationError';

type UserAlreadyExistsEmailContext = {
  readonly email: string;
};

type UserAlreadyExistsPhoneNumberContext = {
  readonly phoneNumber: string;
};

export class UserAlreadyExists extends ApplicationError<
  UserAlreadyExistsEmailContext | UserAlreadyExistsPhoneNumberContext
> {
  public constructor(context: UserAlreadyExistsEmailContext | UserAlreadyExistsPhoneNumberContext) {
    super('User already exists.', context);
  }
}
