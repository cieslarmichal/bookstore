import { faker } from '@faker-js/faker';

import { CustomerEntity } from '../../../contracts/customerEntity';

export class CustomerEntityTestFactory {
  public create(): CustomerEntity {
    return {
      id: faker.datatype.uuid(),
      createdAt: faker.date.recent(3),
      updatedAt: faker.date.recent(1),
      userId: faker.datatype.uuid(),
      user: null,
    };
  }
}
