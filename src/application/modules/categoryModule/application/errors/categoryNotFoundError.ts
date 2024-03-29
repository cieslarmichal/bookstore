import { ApplicationError } from '../../../../../common/errors/applicationError';

interface Context {
  readonly id: string;
}

export class CategoryNotFoundError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CategoryNotFoundError', 'Category not found.', context);
  }
}
