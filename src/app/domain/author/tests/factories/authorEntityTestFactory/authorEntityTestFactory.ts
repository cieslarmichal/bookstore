import { faker } from '@faker-js/faker';
import { AuthorEntity } from '../../../contracts/authorEntity';

export class AuthorEntityTestFactory {
  public create(): AuthorEntity {
    return {
      id: faker.datatype.uuid(),
      createdAt: faker.date.recent(3),
      updatedAt: faker.date.recent(1),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      about: faker.lorem.text(),
    };
  }
}
