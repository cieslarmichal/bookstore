import { faker } from '@faker-js/faker';

import { CategoryEntity } from '../../../infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';

export class CategoryEntityTestFactory {
  public create(input: Partial<CategoryEntity> = {}): CategoryEntity {
    return {
      id: faker.datatype.uuid(),
      name: faker.datatype.uuid(),
      ...input,
    };
  }
}
