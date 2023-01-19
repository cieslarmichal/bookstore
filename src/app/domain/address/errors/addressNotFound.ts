import { ApplicationError } from '../../../common/errors/applicationError';

type AddressNotFoundContext = {
  readonly id: string;
};

export class AddressNotFound extends ApplicationError<AddressNotFoundContext> {
  public constructor(context: AddressNotFoundContext) {
    super('Address not found.', context);
  }
}
