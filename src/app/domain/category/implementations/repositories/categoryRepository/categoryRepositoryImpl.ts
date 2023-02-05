import { EntityManager } from 'typeorm';

import { CategoryQueryBuilder } from './categoryQueryBuilder';
import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Category } from '../../../contracts/category';
import { CategoryEntity } from '../../../contracts/categoryEntity';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';
import { CategoryRepository } from '../../../contracts/repositories/categoryRepository/categoryRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/categoryRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/categoryRepository/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../contracts/repositories/categoryRepository/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../contracts/repositories/categoryRepository/findOnePayload';
import { CategoryNotFoundError } from '../../../errors/categoryNotFoundError';

export class CategoryRepositoryImpl implements CategoryRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly categoryMapper: CategoryMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Category> {
    const { id, name } = PayloadFactory.create(createOnePayloadSchema, input);

    const categoryEntity = this.entityManager.create(CategoryEntity, { id, name });

    const savedCategoryEntity = await this.entityManager.save(categoryEntity);

    return this.categoryMapper.map(savedCategoryEntity);
  }

  public async findOne(input: FindOnePayload): Promise<Category | null> {
    const { id, name } = PayloadFactory.create(findOnePayloadSchema, input);

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
    const { bookId, filters, pagination } = PayloadFactory.create(findManyPayloadSchema, input);

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
    const { id } = PayloadFactory.create(deleteOnePayloadSchema, input);

    const categoryEntity = await this.findOne({ id });

    if (!categoryEntity) {
      throw new CategoryNotFoundError({ id });
    }

    await this.entityManager.delete(CategoryEntity, { id });
  }
}
