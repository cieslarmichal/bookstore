import { ApplicationError } from '../../../../common/errors/applicationError';

interface Context {
  readonly id: string;
}

export class BookNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('BookNotFoundError', 'Book not found.', context);
  }
}
