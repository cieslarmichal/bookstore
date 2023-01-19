import { ApplicationError } from '../../../common/errors/applicationError';

type EmailAlreadySetContext = {
  readonly email: string;
  readonly userId: string;
};

export class EmailAlreadySet extends ApplicationError<EmailAlreadySetContext> {
  public constructor(context: EmailAlreadySetContext) {
    super('User already has email set.', context);
  }
}
