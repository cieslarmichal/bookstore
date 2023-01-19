import { BookCategoryEntity } from '../../contracts/bookCategoryEntity';
import { faker } from '@faker-js/faker';

export class BookCategoryTestDataGenerator {
  public generateData(): BookCategoryEntity {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      bookId: this.generateBookId(),
      categoryId: this.generateCategoryId(),
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

  public generateBookId(): string {
    return faker.datatype.uuid();
  }

  public generateCategoryId(): string {
    return faker.datatype.uuid();
  }
}
