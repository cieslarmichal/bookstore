import { DomainError } from '../../../shared/errors/domainError';

type AddressNotFoundContext = {
  readonly id: string;
};

export class AddressNotFound extends DomainError<AddressNotFoundContext> {
  public constructor(context: AddressNotFoundContext) {
    super('Address not found.', context);
  }
}
