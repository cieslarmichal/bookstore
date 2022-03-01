import { DomainError } from '../../shared/domainError';

type BookNotFoundContext = {
  readonly id: string;
};

export class BookNotFound extends DomainError<BookNotFoundContext> {
  public constructor(context: BookNotFoundContext) {
    super('Book not found.', context);
  }
}
