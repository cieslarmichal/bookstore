import { ApplicationError } from '../../../common/errors/applicationError';

type CategoryAlreadyExistsContext = {
  readonly name: string;
};

export class CategoryAlreadyExists extends ApplicationError<CategoryAlreadyExistsContext> {
  public constructor(context: CategoryAlreadyExistsContext) {
    super('Category already exists.', context);
  }
}
