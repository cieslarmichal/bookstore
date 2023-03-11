import { ApplicationError } from '../../../../common/errors/contracts/applicationError';

interface Context {
  readonly orderCreatorId: string;
  readonly cartCustomerId: string;
}

export class OrderCreatorNotMatchingCustomerIdFromCart extends ApplicationError<Context> {
  public constructor(context: Context) {
    super(
      'OrderCreatorNotMatchingCustomerIdFromCart',
      'Order creator id does not match customer id from cart.',
      context,
    );
  }
}
