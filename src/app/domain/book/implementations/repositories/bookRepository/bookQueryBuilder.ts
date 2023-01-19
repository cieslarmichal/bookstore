import { EntityManager } from 'typeorm';
import { Filter } from '../../../../../common/filter/filter';
import { QueryBuilder } from '../../../../common/queryBuilder';
import { Book } from '../../../contracts/book';

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

  public categoryConditions(categoryId: string): BookQueryBuilder {
    this.instance
      .leftJoinAndSelect('book.bookCategories', 'bookCategories')
      .leftJoinAndSelect('bookCategories.category', 'category');
    this.equalConditionForProperty('category.id', categoryId);
    return this;
  }

  public boookConditions(filters: Filter[]): BookQueryBuilder {
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
