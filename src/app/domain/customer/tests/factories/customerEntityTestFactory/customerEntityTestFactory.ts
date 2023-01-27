import { faker } from '@faker-js/faker';

import { CustomerEntity } from '../../../contracts/customerEntity';

export class CustomerEntityTestFactory {
  public create(): CustomerEntity {
    return {
      id: faker.datatype.uuid(),
      userId: faker.datatype.uuid(),
      user: null,
    };
  }
}
