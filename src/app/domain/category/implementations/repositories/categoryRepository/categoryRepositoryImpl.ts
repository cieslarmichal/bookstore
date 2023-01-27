import { EntityManager } from 'typeorm';

import { CategoryQueryBuilder } from './categoryQueryBuilder';
import { Category } from '../../../contracts/category';
import { CategoryEntity } from '../../../contracts/categoryEntity';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';
import { CategoryRepository } from '../../../contracts/repositories/categoryRepository/categoryRepository';
import { CreateOnePayload } from '../../../contracts/repositories/categoryRepository/createOnePayload';
import { DeleteOnePayload } from '../../../contracts/repositories/categoryRepository/deleteOnePayload';
import { FindManyPayload } from '../../../contracts/repositories/categoryRepository/findManyPayload';
import { FindOnePayload } from '../../../contracts/repositories/categoryRepository/findOnePayload';
import { CategoryNotFoundError } from '../../../errors/categoryNotFoundError';

export class CategoryRepositoryImpl implements CategoryRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly categoryMapper: CategoryMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Category> {
    const categoryEntityInput: CategoryEntity = input;

    const categoryEntity = this.entityManager.create(CategoryEntity, categoryEntityInput);

    const savedCategoryEntity = await this.entityManager.save(categoryEntity);

    return this.categoryMapper.map(savedCategoryEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Category | null> {
    const categoryEntity = await this.entityManager.findOne(CategoryEntity, { where: { ...input } });

    if (!categoryEntity) {
      return null;
    }

    return this.categoryMapper.map(categoryEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Category[]> {
    const { bookId, filters, paginationData } = input;

    let categoryQueryBuilder = new CategoryQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    if (bookId) {
      categoryQueryBuilder = categoryQueryBuilder.whereBookId(bookId);
    }

    const categoriesEntities = await categoryQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return categoriesEntities.map((category) => this.categoryMapper.map(category));
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const category = await this.findOne({ id });

    if (!category) {
      throw new CategoryNotFoundError({ id });
    }

    await this.entityManager.delete(CategoryEntity, { id });
  }
}
