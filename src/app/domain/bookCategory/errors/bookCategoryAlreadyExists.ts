import { DomainError } from '../../../shared/errors/domainError';

type BookCategoryAlreadyExistsContext = {
  readonly bookId: string;
  readonly categoryId: string;
};

export class BookCategoryAlreadyExists extends DomainError<BookCategoryAlreadyExistsContext> {
  public constructor(context: BookCategoryAlreadyExistsContext) {
    super('BookCategory already exists.', context);
  }
}
