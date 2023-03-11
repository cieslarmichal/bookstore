import { EntityManager } from 'typeorm';

import { Validator } from '../../../../../../libs/validator/implementations/validator';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryRepository } from '../../../contracts/repositories/bookCategoryRepository/bookCategoryRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/bookCategoryRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/bookCategoryRepository/deleteOnePayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../contracts/repositories/bookCategoryRepository/findOnePayload';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';

export class BookCategoryRepositoryImpl implements BookCategoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly bookCategoryMapper: BookCategoryMapper,
  ) {}

  public async createOne(input: CreateOnePayload): Promise<BookCategory> {
    const { id, bookId, categoryId } = Validator.validate(createOnePayloadSchema, input);

    const bookCategoryEntity = this.entityManager.create(BookCategoryEntity, { id, bookId, categoryId });

    const savedBookCategoryEntity = await this.entityManager.save(bookCategoryEntity);

    return this.bookCategoryMapper.map(savedBookCategoryEntity);
  }

  public async findOne(input: FindOnePayload): Promise<BookCategory | null> {
    const { id, bookId, categoryId } = Validator.validate(findOnePayloadSchema, input);

    let findOneInput = {};

    if (id) {
      findOneInput = { ...findOneInput, id };
    }

    if (bookId) {
      findOneInput = { ...findOneInput, bookId };
    }

    if (categoryId) {
      findOneInput = { ...findOneInput, categoryId };
    }

    const bookCategoryEntity = await this.entityManager.findOne(BookCategoryEntity, { where: { ...findOneInput } });

    if (!bookCategoryEntity) {
      return null;
    }

    return this.bookCategoryMapper.map(bookCategoryEntity);
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const bookCategoryEntity = await this.findOne({ id });

    if (!bookCategoryEntity) {
      throw new BookCategoryNotFoundError({ id });
    }

    await this.entityManager.delete(BookCategoryEntity, { id });
  }
}
