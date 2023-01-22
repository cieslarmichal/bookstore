import { ApplicationError } from '../../../common/errors/applicationError';

type Context = {
  readonly id: string;
};

export class AuthorNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('AuthorNotFoundError', 'Author not found.', context);
  }
}
