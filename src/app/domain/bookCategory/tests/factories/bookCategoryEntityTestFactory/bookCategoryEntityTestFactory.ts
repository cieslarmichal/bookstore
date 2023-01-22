import { faker } from '@faker-js/faker';

import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';

export class BookCategoryEntityTestFactory {
  public create(): BookCategoryEntity {
    return {
      id: faker.datatype.uuid(),
      createdAt: faker.date.recent(3),
      updatedAt: faker.date.recent(1),
      bookId: faker.datatype.uuid(),
      categoryId: faker.datatype.uuid(),
    };
  }
}
