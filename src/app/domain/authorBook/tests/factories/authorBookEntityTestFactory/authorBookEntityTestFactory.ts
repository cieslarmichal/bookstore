import { faker } from '@faker-js/faker';
import { AuthorBookEntity } from '../../../contracts/authorBookEntity';

export class AuthorBookEntityTestFactory {
  public create(): AuthorBookEntity {
    return {
      id: faker.datatype.uuid(),
      createdAt: faker.date.recent(3),
      updatedAt: faker.date.recent(1),
      authorId: faker.datatype.uuid(),
      bookId: faker.datatype.uuid(),
    };
  }
}
