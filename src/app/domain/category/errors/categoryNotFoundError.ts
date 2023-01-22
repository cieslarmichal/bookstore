import { ApplicationError } from '../../../common/errors/applicationError';

type Context = {
  readonly id: string;
};

export class CategoryNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CategoryNotFoundError', 'Category not found.', context);
  }
}
