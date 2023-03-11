import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly phoneNumber: string;
  readonly userId: string;
}

export class PhoneNumberAlreadySetError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('PhoneNumberAlreadySetError', 'User already has phone number set.', context);
  }
}
