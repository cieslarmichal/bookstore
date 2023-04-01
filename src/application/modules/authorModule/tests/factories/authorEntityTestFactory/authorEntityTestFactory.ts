import { faker } from '@faker-js/faker';

import { AuthorEntity } from '../../../infrastructure/repositories/authorRepository/authorEntity/authorEntity';

export class AuthorEntityTestFactory {
  public create(input: Partial<AuthorEntity> = {}): AuthorEntity {
    return {
      id: faker.datatype.uuid(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      about: faker.lorem.text(),
      ...input,
    };
  }
}
