import { ApplicationError } from '../../../common/errors/applicationError';

type BookNotFoundContext = {
  readonly id: string;
};

export class BookNotFound extends ApplicationError<BookNotFoundContext> {
  public constructor(context: BookNotFoundContext) {
    super('Book not found.', context);
  }
}
