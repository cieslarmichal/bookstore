import { Book } from '../entities/book';
import { Faker } from '@faker-js/faker';

export class BookTestDataGenerator {
  private faker = new Faker();

  public generateData(): Book {}

  public generateId(): number {
    return this.faker.datatype.number();
  }

  public generateCreatedAt(): Date {
    return date.recent(3);
  }

  public generateUpdatedAt(): Date {
    return date.recent(1);
  }

  public generateTitle(): string {
    return lorem.text(10);
  }
}
