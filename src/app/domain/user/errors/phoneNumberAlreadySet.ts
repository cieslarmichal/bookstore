import { ApplicationError } from '../../../common/errors/applicationError';

type PhoneNumberAlreadySetContext = {
  readonly phoneNumber: string;
  readonly userId: string;
};

export class PhoneNumberAlreadySet extends ApplicationError<PhoneNumberAlreadySetContext> {
  public constructor(context: PhoneNumberAlreadySetContext) {
    super('User already has phone number set.', context);
  }
}
