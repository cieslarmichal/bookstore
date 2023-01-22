import { faker } from '@faker-js/faker';

import { CategoryEntity } from '../../../contracts/categoryEntity';

export class CategoryEntityTestFactory {
  public create(): CategoryEntity {
    return {
      id: faker.datatype.uuid(),
      createdAt: faker.date.recent(3),
      updatedAt: faker.date.recent(1),
      name: faker.lorem.word(),
    };
  }
}
