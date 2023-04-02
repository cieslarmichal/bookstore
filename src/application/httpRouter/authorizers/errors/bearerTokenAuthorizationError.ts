import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly authorizationHeader?: string;
  readonly reason: string;
}

export class BearerTokenAuthorizationError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('BearerTokenAuthorizationError', 'Bearer token authorization error.', context);
  }
}
