import { DomainError } from '../../../shared/errors/domainError';

type CategoryAlreadyExistsContext = {
  readonly name: string;
};

export class CategoryAlreadyExists extends DomainError<CategoryAlreadyExistsContext> {
  public constructor(context: CategoryAlreadyExistsContext) {
    super('Category already exists.', context);
  }
}
