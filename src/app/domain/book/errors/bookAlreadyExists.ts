import { DomainError } from '../../shared/domainError';

type BookAlreadyExistsContext = {
  readonly title: string;
  readonly authorId: string;
};

export class BookAlreadyExists extends DomainError<BookAlreadyExistsContext> {
  public constructor(context: BookAlreadyExistsContext) {
    super('Book already exists.', context);
  }
}
