import { EntityManager } from 'typeorm';

import { CategoryEntity } from './categoryEntity/categoryEntity';
import { CategoryMapper } from './categoryMapper/categoryMapper';
import { CategoryQueryBuilder } from './categoryQueryBuilder';
import { Validator } from '../../../../../../libs/validator/validator';
import { CategoryNotFoundError } from '../../../application/errors/categoryNotFoundError';
import { CategoryRepository } from '../../../application/repositories/categoryRepository/categoryRepository';
import {
  CreateCategoryPayload,
  createCategoryPayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/createCategoryPayload';
import {
  DeleteCategoryPayload,
  deleteCategoryPayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/deleteCategoryPayload';
import {
  FindCategoriesPayload,
  findCategoriesPayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/findCategoriesPayload';
import {
  FindCategoryPayload,
  findCategoryPayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/findCategoryPayload';
import { Category } from '../../../domain/entities/category/category';

export class CategoryRepositoryImpl implements CategoryRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly categoryMapper: CategoryMapper) {}

  public async createCategory(input: CreateCategoryPayload): Promise<Category> {
    const { id, name } = Validator.validate(createCategoryPayloadSchema, input);

    const categoryEntity = this.entityManager.create(CategoryEntity, { id, name });

    const savedCategoryEntity = await this.entityManager.save(categoryEntity);

    return this.categoryMapper.map(savedCategoryEntity);
  }

  public async findCategory(input: FindCategoryPayload): Promise<Category | null> {
    const { id, name } = Validator.validate(findCategoryPayloadSchema, input);

    let findOneInput = {};

    if (id) {
      findOneInput = { ...findOneInput, id };
    }

    if (name) {
      findOneInput = { ...findOneInput, name };
    }

    const categoryEntity = await this.entityManager.findOne(CategoryEntity, { where: { ...findOneInput } });

    if (!categoryEntity) {
      return null;
    }

    return this.categoryMapper.map(categoryEntity);
  }

  public async findCategories(input: FindCategoriesPayload): Promise<Category[]> {
    const { bookId, filters, pagination } = Validator.validate(findCategoriesPayloadSchema, input);

    let categoryQueryBuilder = new CategoryQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    if (bookId) {
      categoryQueryBuilder = categoryQueryBuilder.whereBookId(bookId);
    }

    const categoriesEntities = await categoryQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(pagination.limit)
      .getMany();

    return categoriesEntities.map((category) => this.categoryMapper.map(category));
  }

  public async deleteCategory(input: DeleteCategoryPayload): Promise<void> {
    const { id } = Validator.validate(deleteCategoryPayloadSchema, input);

    const categoryEntity = await this.findCategory({ id });

    if (!categoryEntity) {
      throw new CategoryNotFoundError({ id });
    }

    await this.entityManager.delete(CategoryEntity, { id });
  }
}
