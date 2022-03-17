import { DomainError } from '../../../shared/errors/domainError';

type BookCategoryNotFoundCompositeIdContext = {
  readonly bookId: string;
  readonly categoryId: string;
};

type BookCategoryNotFoundIdContext = {
  readonly id: string;
};

export class BookCategoryNotFound extends DomainError<
  BookCategoryNotFoundCompositeIdContext | BookCategoryNotFoundIdContext
> {
  public constructor(context: BookCategoryNotFoundCompositeIdContext | BookCategoryNotFoundIdContext) {
    super('BookCategory not found.', context);
  }
}
