import { ApplicationError } from '../../../common/errors/applicationError';

type BookCategoryAlreadyExistsContext = {
  readonly bookId: string;
  readonly categoryId: string;
};

export class BookCategoryAlreadyExists extends ApplicationError<BookCategoryAlreadyExistsContext> {
  public constructor(context: BookCategoryAlreadyExistsContext) {
    super('BookCategory already exists.', context);
  }
}
