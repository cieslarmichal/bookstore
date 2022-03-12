import { DomainError } from '../../../shared/errors/domainError';

type AuthorBookNotFoundCompositeIdContext = {
  readonly authorId: string;
  readonly bookId: string;
};

type AuthorBookNotFoundIdContext = {
  readonly id: string;
};

export class AuthorBookNotFound extends DomainError<
  AuthorBookNotFoundCompositeIdContext | AuthorBookNotFoundIdContext
> {
  public constructor(context: AuthorBookNotFoundCompositeIdContext | AuthorBookNotFoundIdContext) {
    super('AuthorBook not found.', context);
  }
}
