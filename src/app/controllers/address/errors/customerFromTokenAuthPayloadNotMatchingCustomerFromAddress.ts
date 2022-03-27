import { DomainError } from '../../../shared';

type CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddressContext = {
  readonly customerId: string;
  readonly targetCustomerId: string;
};

export class CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddress extends DomainError<CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddressContext> {
  public constructor(context: CustomerFromTokenAuthPayloadNotMatchingCustomerFromAddressContext) {
    super(`Customer id from user id from access token's payload does not match customer id from address.`, context);
  }
}
