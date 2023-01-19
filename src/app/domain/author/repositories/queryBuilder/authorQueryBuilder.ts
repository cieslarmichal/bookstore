import { QueryBuilder } from '../../../common/queryBuilder';
import { EntityManager } from 'typeorm';
import { Author } from '../../entities/author';
import { Filter } from '../../../../common';

export class AuthorQueryBuilder extends QueryBuilder<Author> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, Author, 'author');
  }

  public bookConditions(bookId: string): AuthorQueryBuilder {
    this.instance.leftJoinAndSelect('author.authorBooks', 'authorBooks').leftJoinAndSelect('authorBooks.book', 'book');
    this.equalConditionForProperty('book.id', bookId);
    return this;
  }

  public authorConditions(filters: Filter[]): AuthorQueryBuilder {
    for (const filter of filters) {
      this.partialConditionsForFilter(`author.${filter.fieldName}`, filter);
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
}
