import { EntityManager } from 'typeorm';

import { Filter } from '../../../../../common/types/contracts/filter';
import { QueryBuilder } from '../../../../../common/types/contracts/queryBuilder';
import { CategoryEntity } from '../../../contracts/categoryEntity';

export class CategoryQueryBuilder extends QueryBuilder<CategoryEntity> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, CategoryEntity, 'category');
  }

  public whereBookId(bookId: string): CategoryQueryBuilder {
    this.instance
      .leftJoinAndSelect('category.bookCategories', 'bookCategories')
      .leftJoinAndSelect('bookCategories.book', 'book');

    this.equalConditionForProperty('book.id', bookId);

    return this;
  }

  public where(filters: Filter[]): CategoryQueryBuilder {
    for (const filter of filters) {
      this.partialConditionsForFilter(`category.${filter.fieldName}`, filter);
    }

    return this;
  }

  public skip(enitiesToSkip: number): CategoryQueryBuilder {
    this.instance = this.instance.skip(enitiesToSkip);
    return this;
  }

  public take(enitiesToTake: number): CategoryQueryBuilder {
    this.instance = this.instance.take(enitiesToTake);
    return this;
  }
}
