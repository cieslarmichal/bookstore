import { Category } from '../entities/category';
import { faker } from '@faker-js/faker';

export class CategoryTestDataGenerator {
  public generateData(): Category {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      name: this.generateName(),
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

  public generateName(): string {
    return faker.lorem.word();
  }
}
