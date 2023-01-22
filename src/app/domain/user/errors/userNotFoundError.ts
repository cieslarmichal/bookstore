import { ApplicationError } from '../../../common/errors/applicationError';

type UserNotFoundIdContext = {
  readonly id: string;
};

type UserNotFoundEmailContext = {
  readonly email: string;
};

type UserNotFoundPhoneNumberContext = {
  readonly phoneNumber: string;
};
export class UserNotFoundError extends ApplicationError<
  UserNotFoundIdContext | UserNotFoundEmailContext | UserNotFoundPhoneNumberContext
> {
  public constructor(context: UserNotFoundIdContext | UserNotFoundEmailContext | UserNotFoundPhoneNumberContext) {
    super('UserNotFoundError', 'User not found.', context);
  }
}
