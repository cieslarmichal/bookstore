import { EntityManager } from 'typeorm';

import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryRepository } from '../../../contracts/repositories/bookCategoryRepository/bookCategoryRepository';
import { CreateOnePayload } from '../../../contracts/repositories/bookCategoryRepository/createOnePayload';
import { DeleteOnePayload } from '../../../contracts/repositories/bookCategoryRepository/deleteOnePayload';
import { FindOnePayload } from '../../../contracts/repositories/bookCategoryRepository/findOnePayload';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';

export class BookCategoryRepositoryImpl implements BookCategoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly bookCategoryMapper: BookCategoryMapper,
  ) {}

  public async createOne(input: CreateOnePayload): Promise<BookCategory> {
    const bookCategoryEntityInput: BookCategoryEntity = input;

    const bookCategoryEntity = this.entityManager.create(BookCategoryEntity, bookCategoryEntityInput);

    const savedBookCategoryEntity = await this.entityManager.save(bookCategoryEntity);

    return this.bookCategoryMapper.map(savedBookCategoryEntity);
  }

  public async findOne(input: FindOnePayload): Promise<BookCategory | null> {
    const bookCategoryEntity = await this.entityManager.findOne(BookCategoryEntity, { where: { ...input } });

    if (!bookCategoryEntity) {
      return null;
    }

    return this.bookCategoryMapper.map(bookCategoryEntity);
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const bookCategoryEntity = await this.findOne({ id });

    if (!bookCategoryEntity) {
      throw new BookCategoryNotFoundError({ id });
    }

    await this.entityManager.delete(BookCategoryEntity, { id });
  }
}
