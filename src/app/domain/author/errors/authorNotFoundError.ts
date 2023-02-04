import { ApplicationError } from '../../../common/errors/contracts/applicationError';

interface Context {
  readonly id: string;
}

export class AuthorNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('AuthorNotFoundError', 'Author not found.', context);
  }
}
