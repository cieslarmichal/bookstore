import { ApplicationError } from '../../../common/errors/applicationError';

type AuthorBookAlreadyExistsContext = {
  readonly authorId: string;
  readonly bookId: string;
};

export class AuthorBookAlreadyExists extends ApplicationError<AuthorBookAlreadyExistsContext> {
  public constructor(context: AuthorBookAlreadyExistsContext) {
    super('AuthorBook already exists.', context);
  }
}
