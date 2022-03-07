import { DomainError } from '../../../shared/errors/domainError';

type AuthorNotFoundContext = {
  readonly id: string;
};

export class AuthorNotFound extends DomainError<AuthorNotFoundContext> {
  public constructor(context: AuthorNotFoundContext) {
    super('Author not found.', context);
  }
}
