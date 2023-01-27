import { faker } from '@faker-js/faker';

import { BookEntity } from '../../../contracts/bookEntity';
import { BookFormat } from '../../../contracts/bookFormat';
import { BookLanguage } from '../../../contracts/bookLanguage';

export class BookEntityTestFactory {
  public create(): BookEntity {
    return {
      id: faker.datatype.uuid(),
      title: faker.lorem.words(2),
      releaseYear: faker.datatype.number({ min: 1000, max: 2100 }),
      language: faker.helpers.arrayElement([BookLanguage.en, BookLanguage.pl]),
      format: faker.helpers.arrayElement([BookFormat.hardcover, BookFormat.paperback, BookFormat.paperback]),
      description: faker.lorem.words(),
      price: faker.datatype.number({ min: 1, max: 1000 }),
    };
  }
}
