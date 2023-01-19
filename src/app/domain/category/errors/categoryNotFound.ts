import { ApplicationError } from '../../../common/errors/applicationError';

type CategoryNotFoundContext = {
  readonly id: string;
};

export class CategoryNotFound extends ApplicationError<CategoryNotFoundContext> {
  public constructor(context: CategoryNotFoundContext) {
    super('Category not found.', context);
  }
}
