import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly id: string;
}

export class ReviewNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('ReviewNotFoundError', 'Review not found.', context);
  }
}
