import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly authorId: string;
  readonly bookId: string;
}

export class AuthorBookAlreadyExistsError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('AuthorBookAlreadyExistsError', 'AuthorBook already exists.', context);
  }
}
