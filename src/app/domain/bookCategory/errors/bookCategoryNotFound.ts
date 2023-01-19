import { ApplicationError } from '../../../common/errors/applicationError';

type BookCategoryNotFoundCompositeIdContext = {
  readonly bookId: string;
  readonly categoryId: string;
};

type BookCategoryNotFoundIdContext = {
  readonly id: string;
};

export class BookCategoryNotFound extends ApplicationError<
  BookCategoryNotFoundCompositeIdContext | BookCategoryNotFoundIdContext
> {
  public constructor(context: BookCategoryNotFoundCompositeIdContext | BookCategoryNotFoundIdContext) {
    super('BookCategory not found.', context);
  }
}
