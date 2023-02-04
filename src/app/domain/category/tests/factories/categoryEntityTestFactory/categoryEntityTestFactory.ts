import { faker } from '@faker-js/faker';

import { CategoryEntity } from '../../../contracts/categoryEntity';

export class CategoryEntityTestFactory {
  public create(input: Partial<CategoryEntity> = {}): CategoryEntity {
    return {
      id: faker.datatype.uuid(),
      name: faker.lorem.word(),
      ...input,
    };
  }
}
