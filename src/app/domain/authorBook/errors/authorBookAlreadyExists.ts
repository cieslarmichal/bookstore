import { DomainError } from '../../../shared/errors/domainError';

type AuthorBookAlreadyExistsContext = {
  readonly authorId: string;
  readonly bookId: string;
};

export class AuthorBookAlreadyExists extends DomainError<AuthorBookAlreadyExistsContext> {
  public constructor(context: AuthorBookAlreadyExistsContext) {
    super('AuthorBook already exists.', context);
  }
}
