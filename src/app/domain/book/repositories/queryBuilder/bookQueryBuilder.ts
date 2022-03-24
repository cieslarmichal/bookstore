import { QueryBuilder } from '../../../shared/queryBuilder';
import { EntityManager } from 'typeorm';
import { Book } from '../../entities/book';
import { Filter } from '../../../../shared';

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

  public async getMany(): Promise<Book[]> {
    return this.instance.getMany();
  }
}
