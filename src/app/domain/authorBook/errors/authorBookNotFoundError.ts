import { ApplicationError } from '../../../common/errors/contracts/applicationError';

type AuthorBookNotFoundCompositeIdContext = {
  readonly authorId: string;
  readonly bookId: string;
};

type AuthorBookNotFoundIdContext = {
  readonly id: string;
};

export class AuthorBookNotFoundError extends ApplicationError<
  AuthorBookNotFoundCompositeIdContext | AuthorBookNotFoundIdContext
> {
  public constructor(context: AuthorBookNotFoundCompositeIdContext | AuthorBookNotFoundIdContext) {
    super('AuthorBookNotFoundError', 'AuthorBook not found.', context);
  }
}
