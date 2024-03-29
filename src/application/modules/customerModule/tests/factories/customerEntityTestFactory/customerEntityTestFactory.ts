import { faker } from '@faker-js/faker';

import { CustomerEntity } from '../../../infrastructure/repositories/customerRepository/customerEntity/customerEntity';

export class CustomerEntityTestFactory {
  public create(input: Partial<CustomerEntity> = {}): CustomerEntity {
    return {
      id: faker.datatype.uuid(),
      userId: faker.datatype.uuid(),
      ...input,
    };
  }
}
