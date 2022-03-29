import { DomainError } from '../../../shared/errors/domainError';

type PhoneNumberAlreadySetContext = {
  readonly phoneNumber: string;
  readonly userId: string;
};

export class PhoneNumberAlreadySet extends DomainError<PhoneNumberAlreadySetContext> {
  public constructor(context: PhoneNumberAlreadySetContext) {
    super('User already has phone number set.', context);
  }
}
