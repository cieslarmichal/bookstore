import { EntityManager } from 'typeorm';

import { CategoryEntity } from './categoryEntity/categoryEntity';
import { CategoryMapper } from './categoryMapper/categoryMapper';
import { CategoryQueryBuilder } from './categoryQueryBuilder';
import { Validator } from '../../../../../../libs/validator/validator';
import { CategoryRepository } from '../../../application/repositories/categoryRepository/categoryRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/categoryRepository/payloads/findOnePayload';
import { Category } from '../../../domain/entities/category/category';
import { CategoryNotFoundError } from '../../errors/categoryNotFoundError';

export class CategoryRepositoryImpl implements CategoryRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly categoryMapper: CategoryMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Category> {
    const { id, name } = Validator.validate(createOnePayloadSchema, input);

    const categoryEntity = this.entityManager.create(CategoryEntity, { id, name });

    const savedCategoryEntity = await this.entityManager.save(categoryEntity);

    return this.categoryMapper.map(savedCategoryEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Category | null> {
    const { id, name } = Validator.validate(findOnePayloadSchema, input);

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

  public async findMany(input: FindManyPayload): Promise<Category[]> {
    const { bookId, filters, pagination } = Validator.validate(findManyPayloadSchema, input);

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

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const categoryEntity = await this.findOne({ id });

    if (!categoryEntity) {
      throw new CategoryNotFoundError({ id });
    }

    await this.entityManager.delete(CategoryEntity, { id });
  }
}
