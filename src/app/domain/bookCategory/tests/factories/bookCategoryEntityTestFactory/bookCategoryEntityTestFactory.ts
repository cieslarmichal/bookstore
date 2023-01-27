import { faker } from '@faker-js/faker';

import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';

export class BookCategoryEntityTestFactory {
  public create(): BookCategoryEntity {
    return {
      id: faker.datatype.uuid(),
      bookId: faker.datatype.uuid(),
      categoryId: faker.datatype.uuid(),
    };
  }
}
