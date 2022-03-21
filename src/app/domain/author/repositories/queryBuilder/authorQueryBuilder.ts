import { QueryBuilder } from '../../../shared/queryBuilder';
import { EntityManager } from 'typeorm';
import { Author } from '../../entities/author';
import { FindAuthorsData } from '../types';

export class AuthorQueryBuilder extends QueryBuilder<Author> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, Author, 'author');
  }

  public bookConditions(bookId: string): AuthorQueryBuilder {
    this.instance.leftJoinAndSelect('author.authorBooks', 'authorBooks').leftJoinAndSelect('authorBooks.book', 'book');
    this.equalConditionForProperty('book.id', bookId);
    return this;
  }

  public authorConditions(findAuthorsData: FindAuthorsData): AuthorQueryBuilder {
    if (findAuthorsData.firstName) {
      this.partialConditionsForFilterProperty('author.firstName', findAuthorsData.firstName);
    }

    if (findAuthorsData.lastName) {
      this.partialConditionsForFilterProperty('author.lastName', findAuthorsData.lastName);
    }

    return this;
  }

  public skip(enitiesToSkip: number): AuthorQueryBuilder {
    this.instance = this.instance.skip(enitiesToSkip);
    return this;
  }

  public take(enitiesToTake: number): AuthorQueryBuilder {
    this.instance = this.instance.take(enitiesToTake);
    return this;
  }

  public async getMany(): Promise<Author[]> {
    return this.instance.getMany();
  }
}
