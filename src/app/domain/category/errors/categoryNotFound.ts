import { DomainError } from '../../../shared/errors/domainError';

type CategoryNotFoundContext = {
  readonly id: string;
};

export class CategoryNotFound extends DomainError<CategoryNotFoundContext> {
  public constructor(context: CategoryNotFoundContext) {
    super('Category not found.', context);
  }
}
