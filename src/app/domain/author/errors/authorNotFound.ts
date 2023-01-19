import { ApplicationError } from '../../../common/errors/applicationError';

type AuthorNotFoundContext = {
  readonly id: string;
};

export class AuthorNotFound extends ApplicationError<AuthorNotFoundContext> {
  public constructor(context: AuthorNotFoundContext) {
    super('Author not found.', context);
  }
}
