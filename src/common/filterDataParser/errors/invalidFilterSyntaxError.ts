import { ApplicationError } from '../../errors/contracts/applicationError';

interface Context {
  readonly errorDetails: string;
}

export class InvalidFilterSyntaxError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('InvalidFilterSyntaxError', 'Error while parsing filter object', context);
  }
}
