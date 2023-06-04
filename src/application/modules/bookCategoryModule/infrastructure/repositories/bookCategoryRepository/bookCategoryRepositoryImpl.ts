import { EntityManager } from 'typeorm';

import { BookCategoryEntity } from './bookCategoryEntity/bookCategoryEntity';
import { BookCategoryMapper } from './bookCategoryMapper/bookCategoryMapper';
import { Validator } from '../../../../../../libs/validator/validator';
import { BookCategoryRepository } from '../../../application/repositories/bookCategoryRepository/bookCategoryRepository';
import {
  CreateBookCategoryPayload,
  createBookCategoryPayloadSchema,
} from '../../../application/repositories/bookCategoryRepository/payloads/createBookCategoryPayload';
import {
  DeleteBookCategoryPayload,
  deleteBookCategoryPayloadSchema,
} from '../../../application/repositories/bookCategoryRepository/payloads/deleteBookCategoryPayload';
import {
  FindBookCategoryPayload,
  findBookCategoryPayloadSchema,
} from '../../../application/repositories/bookCategoryRepository/payloads/findBookCategoryPayload';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';
import { BookCategoryNotFoundError } from '../../../application/errors/bookCategoryNotFoundError';

export class BookCategoryRepositoryImpl implements BookCategoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly bookCategoryMapper: BookCategoryMapper,
  ) {}

  public async createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory> {
    const { id, bookId, categoryId } = Validator.validate(createBookCategoryPayloadSchema, input);

    const bookCategoryEntity = this.entityManager.create(BookCategoryEntity, { id, bookId, categoryId });

    const savedBookCategoryEntity = await this.entityManager.save(bookCategoryEntity);

    return this.bookCategoryMapper.map(savedBookCategoryEntity);
  }

  public async findBookCategory(input: FindBookCategoryPayload): Promise<BookCategory | null> {
    const { id, bookId, categoryId } = Validator.validate(findBookCategoryPayloadSchema, input);

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

  public async deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void> {
    const { id } = Validator.validate(deleteBookCategoryPayloadSchema, input);

    const bookCategoryEntity = await this.findBookCategory({ id });

    if (!bookCategoryEntity) {
      throw new BookCategoryNotFoundError({ id });
    }

    await this.entityManager.delete(BookCategoryEntity, { id });
  }
}
