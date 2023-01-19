import faker from '@faker-js/faker';
import { BookEntity } from '../../contracts/bookEntity';
import { BookFormat } from '../../contracts/bookFormat';
import { BookLanguage } from '../../contracts/bookLanguage';

export class BookTestDataGenerator {
  public generateData(): BookEntity {
    return {
      id: this.generateId(),
      createdAt: this.generateCreatedAt(),
      updatedAt: this.generateUpdatedAt(),
      title: this.generateTitle(),
      releaseYear: this.generateReleaseYear(),
      language: this.generateLanguage(),
      format: this.generateFormat(),
      description: this.generateDescription(),
      price: this.generatePrice(),
      authorBooks: null,
      bookCategories: null,
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

  public generateTitle(): string {
    return faker.lorem.words(2);
  }

  public generateAuthorId(): string {
    return faker.datatype.uuid();
  }

  public generateCategoryId(): string {
    return faker.datatype.uuid();
  }

  public generateReleaseYear(): number {
    return faker.datatype.number({ min: 1000, max: 2100 });
  }

  public generateLanguage(): BookLanguage {
    return faker.helpers.randomize([BookLanguage.en, BookLanguage.pl]);
  }

  public generateFormat(): BookFormat {
    return faker.helpers.randomize([BookFormat.hardcover, BookFormat.paperback, BookFormat.paperback]);
  }

  public generateDescription(): string {
    return faker.lorem.text(50);
  }

  public generatePrice(): number {
    return faker.datatype.number({ min: 1, max: 1000 });
  }
}
