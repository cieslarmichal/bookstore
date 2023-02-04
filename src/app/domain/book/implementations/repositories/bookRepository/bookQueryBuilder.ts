import { EntityManager } from 'typeorm';

import { Filter } from '../../../../../common/filter/filter';
import { QueryBuilder } from '../../../../../common/queryBuilder/queryBuilder';
import { BookEntity } from '../../../contracts/bookEntity';

export class BookQueryBuilder extends QueryBuilder<BookEntity> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, BookEntity, 'book');
  }

  public whereAuthorId(authorId: string): BookQueryBuilder {
    this.instance
      .leftJoinAndSelect('book.authorBooks', 'authorBooks')
      .leftJoinAndSelect('authorBooks.author', 'author');
    this.equalConditionForProperty('author.id', authorId);
    return this;
  }

  public whereCategoryId(categoryId: string): BookQueryBuilder {
    this.instance
      .leftJoinAndSelect('book.bookCategories', 'bookCategories')
      .leftJoinAndSelect('bookCategories.category', 'category');
    this.equalConditionForProperty('category.id', categoryId);
    return this;
  }

  public where(filters: Filter[]): BookQueryBuilder {
    for (const filter of filters) {
      this.partialConditionsForFilter(`book.${filter.fieldName}`, filter);
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
}
