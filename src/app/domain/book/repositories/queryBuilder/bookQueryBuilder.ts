import { QueryBuilder } from '../../../shared/queryBuilder';
import { EntityManager } from 'typeorm';
import { Book } from '../../entities/book';
import { FindBooksData } from '../types';

export class BookQueryBuilder extends QueryBuilder<Book> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, Book, 'book');
  }

  public conditions(findBooksData: FindBooksData): BookQueryBuilder {
    if (findBooksData.title) {
      this.partialConditionsForFilterProperty('book_title', findBooksData.title);
    }

    if (findBooksData.releaseYear) {
      this.partialConditionsForFilterProperty('book_releaseYear', findBooksData.releaseYear);
    }

    if (findBooksData.language) {
      this.partialConditionsForFilterProperty('book_language', findBooksData.language);
    }

    if (findBooksData.format) {
      this.partialConditionsForFilterProperty('book_format', findBooksData.format);
    }

    if (findBooksData.price) {
      this.partialConditionsForFilterProperty('book_price', findBooksData.price);
    }

    return this;
  }

  public skip(enitiesToSkip: number): BookQueryBuilder {
    this.instance = this.instance.skip(enitiesToSkip);
    return this;
  }

  public take(enitiesToTake: number): BookQueryBuilder {
    this.instance = this.instance.take(enitiesToTake);
    return this;
  }

  public async getMany(): Promise<Book[]> {
    return this.instance.getMany();
  }

  public getSql(): string {
    return this.instance.getSql();
  }
}
