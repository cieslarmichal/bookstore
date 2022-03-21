import { QueryBuilder } from '../../../shared/queryBuilder';
import { EntityManager } from 'typeorm';
import { Category } from '../../entities/category';
import { FindCategoriesData } from '../types';

export class CategoryQueryBuilder extends QueryBuilder<Category> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, Category, 'category');
  }

  public bookConditions(bookId: string): CategoryQueryBuilder {
    this.instance
      .leftJoinAndSelect('category.bookCategories', 'bookCategories')
      .leftJoinAndSelect('bookCategories.book', 'book');
    this.equalConditionForProperty('book.id', bookId);
    return this;
  }

  public categoryConditions(findCategorysData: FindCategoriesData): CategoryQueryBuilder {
    if (findCategorysData.name) {
      this.partialConditionsForFilterProperty('category.name', findCategorysData.name);
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

  public async getMany(): Promise<Category[]> {
    return this.instance.getMany();
  }
}
