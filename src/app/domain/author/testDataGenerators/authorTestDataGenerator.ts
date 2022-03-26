import { Author } from '../entities/author';
import { faker } from '@faker-js/faker';

export class AuthorTestDataGenerator {
  public generateData(): Author {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      firstName: this.generateFirstName(),
      lastName: this.generateLastName(),
      about: this.generateAbout(),
    };
  }

  public generateId(): string {
    return faker.datatype.uuid();
  }

  public generateCreatedAt(): Date {
    return faker.date.recent(3);
  }

  public generateUpdatedAt(): Date {
    return faker.date.recent(1);
  }

  public generateFirstName(): string {
    return faker.name.firstName();
  }

  public generateLastName(): string {
    return faker.name.lastName();
  }

  public generateAbout(): string {
    return faker.lorem.text(50);
  }
}
