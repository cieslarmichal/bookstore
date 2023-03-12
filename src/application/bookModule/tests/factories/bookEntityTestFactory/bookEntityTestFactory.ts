import { faker } from '@faker-js/faker';

import { BookFormat } from '../../../domain/entities/book/bookFormat';
import { BookLanguage } from '../../../domain/entities/book/bookLanguage';
import { BookEntity } from '../../../infrastructure/repositories/bookRepository/bookEntity/bookEntity';

export class BookEntityTestFactory {
  public create(input: Partial<BookEntity> = {}): BookEntity {
    return {
      id: faker.datatype.uuid(),
      title: faker.lorem.words(2),
      isbn: faker.datatype.number({ min: 1000000000000, max: 9999999999999 }).toString(),
      releaseYear: faker.datatype.number({ min: 1000, max: 2100 }),
      language: faker.helpers.arrayElement([BookLanguage.en, BookLanguage.pl]),
      format: faker.helpers.arrayElement([BookFormat.hardcover, BookFormat.paperback, BookFormat.paperback]),
      description: faker.lorem.words(),
      price: faker.datatype.number({ min: 1, max: 1000 }),
      ...input,
    };
  }
}
