import { EntityRepository, EntityManager, FindConditions } from 'typeorm';

import { CategoryQueryBuilder } from './categoryQueryBuilder';
import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { Category } from '../../../contracts/category';
import { CategoryEntity } from '../../../contracts/categoryEntity';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';
import { CategoryRepository } from '../../../contracts/repositories/categoryRepository/categoryRepository';
import { CategoryNotFoundError } from '../../../errors/categoryNotFoundError';

@EntityRepository()
export class CategoryRepositoryImpl implements CategoryRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly categoryMapper: CategoryMapper) {}

  public async createOne(categoryData: Partial<CategoryEntity>): Promise<Category> {
    const category = this.entityManager.create(CategoryEntity, categoryData);

    const savedCategory = await this.entityManager.save(category);

    return this.categoryMapper.map(savedCategory);
  }

  public async findOne(conditions: FindConditions<CategoryEntity>): Promise<Category | null> {
    const category = await this.entityManager.findOne(CategoryEntity, conditions);

    if (!category) {
      return null;
    }

    return this.categoryMapper.map(category);
  }

  public async findOneById(id: string): Promise<Category | null> {
    return this.findOne({ id });
  }

  public async findMany(filters: Filter[], paginationData: PaginationData): Promise<Category[]> {
    const categoryQueryBuilder = new CategoryQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const categories = await categoryQueryBuilder
      .categoryConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return categories.map((category) => this.categoryMapper.map(category));
  }

  public async findManyByBookId(
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Category[]> {
    const categoryQueryBuilder = new CategoryQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const categories = await categoryQueryBuilder
      .bookConditions(bookId)
      .categoryConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return categories.map((category) => this.categoryMapper.map(category));
  }

  public async updateOne(id: string, categoryData: Partial<CategoryEntity>): Promise<Category> {
    const category = await this.findOneById(id);

    if (!category) {
      throw new CategoryNotFoundError({ id });
    }

    await this.entityManager.update(CategoryEntity, { id }, categoryData);

    return this.findOneById(id) as Promise<Category>;
  }

  public async removeOne(id: string): Promise<void> {
    const category = await this.findOneById(id);

    if (!category) {
      throw new CategoryNotFoundError({ id });
    }

    await this.entityManager.delete(CategoryEntity, { id });
  }
}
