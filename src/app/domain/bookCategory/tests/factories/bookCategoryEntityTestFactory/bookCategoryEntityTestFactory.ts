import { faker } from '@faker-js/faker';

import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';

export class BookCategoryEntityTestFactory {
  public create(input: Partial<BookCategoryEntity> = {}): BookCategoryEntity {
    return {
      id: faker.datatype.uuid(),
      bookId: faker.datatype.uuid(),
      categoryId: faker.datatype.uuid(),
      ...input,
    };
  }
}
