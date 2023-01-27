import { faker } from '@faker-js/faker';

import { AuthorBookEntity } from '../../../contracts/authorBookEntity';

export class AuthorBookEntityTestFactory {
  public create(): AuthorBookEntity {
    return {
      id: faker.datatype.uuid(),
      authorId: faker.datatype.uuid(),
      bookId: faker.datatype.uuid(),
    };
  }
}
