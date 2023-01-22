import { ApplicationError } from '../../../common/errors/applicationError';

type Context = {
  readonly bookId: string;
  readonly categoryId: string;
};

export class BookCategoryAlreadyExistsError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('BookCategoryAlreadyExistsError', 'BookCategory already exists.', context);
  }
}
