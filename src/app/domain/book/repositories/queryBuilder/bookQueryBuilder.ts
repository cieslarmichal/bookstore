import { QueryBuilder } from '../../../shared/queryBuilder';
import { EntityManager } from 'typeorm';
import { Book } from '../../entities/book';
import { FindBooksData } from '../types';

export class BookQueryBuilder extends QueryBuilder<Book> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, Book, 'book');
  }

  public authorConditions(authorId: string): BookQueryBuilder {
    this.instance
      .leftJoinAndSelect('book.authorBooks', 'authorBooks')
      .leftJoinAndSelect('authorBooks.author', 'author');
    this.equalConditionForProperty('author.id', authorId);
    return this;
  }

  public boookConditions(findBooksData: FindBooksData): BookQueryBuilder {
    if (findBooksData.title) {
      this.partialConditionsForFilterProperty('book.title', findBooksData.title);
    }

    if (findBooksData.releaseYear) {
      this.partialConditionsForFilterProperty('book.releaseYear', findBooksData.releaseYear);
    }

    if (findBooksData.language) {
      this.partialConditionsForFilterProperty('book.language', findBooksData.language);
    }

    if (findBooksData.format) {
      this.partialConditionsForFilterProperty('book.format', findBooksData.format);
    }

    if (findBooksData.price) {
      this.partialConditionsForFilterProperty('book.price', findBooksData.price);
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
}
