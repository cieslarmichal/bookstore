import { CustomerEntityTestFactory } from '../../../tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { CustomerMapperImpl } from './customerMapperImpl';

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
