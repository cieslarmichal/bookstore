import { EntityManager } from 'typeorm';
import { Filter } from '../../../../../common/filter/filter';
import { QueryBuilder } from '../../../../common/queryBuilder';
import { AuthorEntity } from '../../../contracts/authorEntity';

export class AuthorQueryBuilder extends QueryBuilder<AuthorEntity> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, AuthorEntity, 'author');
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