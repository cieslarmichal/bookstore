import 'reflect-metadata';

import { CustomerMapperImpl } from './customerMapperImpl';
import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';

describe('CustomerMapperImpl', () => {
  let customerMapperImpl: CustomerMapperImpl;

  const customerEntityTestFactory = new CustomerEntityTestFactory();

  beforeAll(async () => {
    customerMapperImpl = new CustomerMapperImpl();
  });

  it('maps a customer entity to a customer', async () => {
    expect.assertions(1);

    const customerEntity = customerEntityTestFactory.create();

    const customer = customerMapperImpl.map(customerEntity);

    expect(customer).toEqual({
      id: customerEntity.id,
      userId: customerEntity.userId,
    });
  });
});
