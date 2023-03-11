import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly name: string;
}

export class CategoryAlreadyExistsError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('CategoryAlreadyExistsError', 'Category already exists.', context);
  }
}
