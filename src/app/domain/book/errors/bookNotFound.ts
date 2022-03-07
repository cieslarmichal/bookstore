import { DomainError } from '../../../shared/errors/domainError';

type BookNotFoundContext = {
  readonly id: string;
};

export class BookNotFound extends DomainError<BookNotFoundContext> {
  public constructor(context: BookNotFoundContext) {
    super('Book not found.', context);
  }
}
