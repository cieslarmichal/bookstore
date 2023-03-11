import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly name?: string;
  readonly message: string;
}

export class HttpServiceError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('HttpServiceError', 'Http service error.', context);
  }
}
