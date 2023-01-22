import { ApplicationError } from '../../../../common/errors/applicationError';

type Context = {
  readonly errorDetails: string;
};

export class InvalidFilterSyntaxError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('InvalidFilterSyntaxError', 'Error while parsing filter object', context);
  }
}
