import { DomainError } from '../../../shared/errors/domainError';

type EmailAlreadySetContext = {
  readonly email: string;
  readonly userId: string;
};

export class EmailAlreadySet extends DomainError<EmailAlreadySetContext> {
  public constructor(context: EmailAlreadySetContext) {
    super('User already has email set.', context);
  }
}
