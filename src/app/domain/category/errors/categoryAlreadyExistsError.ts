import { ApplicationError } from '../../../common/errors/applicationError';

type Context = {
  readonly name: string;
};

export class CategoryAlreadyExistsError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CategoryAlreadyExistsError', 'Category already exists.', context);
  }
}
