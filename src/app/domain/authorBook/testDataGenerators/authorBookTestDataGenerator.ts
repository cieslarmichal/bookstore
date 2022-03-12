import { AuthorBook } from '../entities/authorBook';
import { faker } from '@faker-js/faker';

export class AuthorBookTestDataGenerator {
  public generateData(): AuthorBook {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      authorId: this.generateAuthorId(),
      bookId: this.generateBookId(),
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

  public generateAuthorId(): string {
    return faker.datatype.uuid();
  }

  public generateBookId(): string {
    return faker.datatype.uuid();
  }
}
