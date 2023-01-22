import { describe, it, beforeAll, expect } from 'vitest';

import { CustomerMapperImpl } from './customerMapperImpl';
import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';

describe('CustomerMapperImpl', () => {
  let customerMapperImpl: CustomerMapperImpl;
  let customerEntityTestFactory: CustomerEntityTestFactory;

  beforeAll(async () => {
    customerEntityTestFactory = new CustomerEntityTestFactory();
    customerMapperImpl = new CustomerMapperImpl();
  });

  it('maps a customer entity to a customer', async () => {
    expect.assertions(1);

    const customerEntity = customerEntityTestFactory.create();

    const customer = customerMapperImpl.map(customerEntity);

    expect(customer).toStrictEqual({
      id: customerEntity.id,
      createdAt: customerEntity.createdAt,
      updatedAt: customerEntity.updatedAt,
      userId: customerEntity.userId,
    });
  });
});
