import { ApplicationError } from '../../../common/errors/applicationError';

type AuthorBookNotFoundCompositeIdContext = {
  readonly authorId: string;
  readonly bookId: string;
};

type AuthorBookNotFoundIdContext = {
  readonly id: string;
};

export class AuthorBookNotFound extends ApplicationError<
  AuthorBookNotFoundCompositeIdContext | AuthorBookNotFoundIdContext
> {
  public constructor(context: AuthorBookNotFoundCompositeIdContext | AuthorBookNotFoundIdContext) {
    super('AuthorBook not found.', context);
  }
}
