import { ApplicationError } from '../../../common/errors/applicationError';

type Context = {
  readonly email: string;
  readonly userId: string;
};

export class EmailAlreadySetError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('EmailAlreadySetError', 'User already has email set.', context);
  }
}
