import { Book } from '../entities/book';
import { Faker } from '@faker-js/faker';
import { BookFormat, BookLanguage } from '../types';

export class BookTestDataGenerator {
  private faker = new Faker();

  public generateData(): Book {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      title: this.generateTitle(),
      author: this.generateAuthor(),
      releaseYear: this.generateReleaseYear(),
      language: this.generateLanguage(),
      format: this.generateFormat(),
      description: this.generateDescription(),
      price: this.generatePrice(),
    };
  }

  public generateId(): number {
    return this.faker.datatype.number();
  }

  public generateCreatedAt(): Date {
    return this.faker.date.recent(3);
  }

  public generateUpdatedAt(): Date {
    return this.faker.date.recent(1);
  }

  public generateTitle(): string {
    return this.faker.lorem.text(10);
  }

  public generateAuthor(): string {
    return this.faker.name.firstName() + ' ' + this.faker.name.lastName();
  }

  public generateReleaseYear(): number {
    return this.faker.datatype.number({ min: 1000, max: 2100 });
  }

  public generateLanguage(): BookLanguage {
    return this.faker.helpers.randomize([BookLanguage.en, BookLanguage.pl]);
  }

  public generateFormat(): BookFormat {
    return this.faker.helpers.randomize([BookFormat.hardcover, BookFormat.paperback, BookFormat.paperback]);
  }

  public generateDescription(): string {
    return this.faker.lorem.text(50);
  }

  public generatePrice(): number {
    return this.faker.datatype.number({ min: 1, max: 1000 });
  }
}
