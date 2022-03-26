import { Customer } from '../entities/customer';
import { faker } from '@faker-js/faker';

export class CustomerTestDataGenerator {
  public generateData(): Customer {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      userId: this.generateUserId(),
      user: null,
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

  public generateUserId(): string {
    return faker.datatype.uuid();
  }
}
