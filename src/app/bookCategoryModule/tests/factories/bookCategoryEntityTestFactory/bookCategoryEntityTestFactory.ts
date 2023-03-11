import { faker } from '@faker-js/faker';

import { BookCategoryEntity } from '../../../infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';

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
