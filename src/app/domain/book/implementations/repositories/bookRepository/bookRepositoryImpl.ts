import { EntityManager } from 'typeorm';

import { BookQueryBuilder } from './bookQueryBuilder';
import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import { Book } from '../../../contracts/book';
import { BookEntity } from '../../../contracts/bookEntity';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';
import { BookRepository } from '../../../contracts/repositories/bookRepository/bookRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../contracts/repositories/bookRepository/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../contracts/repositories/bookRepository/deleteOnePayload';
import { FindManyPayload, findManyPayloadSchema } from '../../../contracts/repositories/bookRepository/findManyPayload';
import { FindOnePayload, findOnePayloadSchema } from '../../../contracts/repositories/bookRepository/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../contracts/repositories/bookRepository/updateOnePayload';
import { BookNotFoundError } from '../../../errors/bookNotFoundError';

export class BookRepositoryImpl implements BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Book> {
    const { id, title, releaseYear, format, language, price, description } = PayloadFactory.create(
      createOnePayloadSchema,
      input,
    );

    let bookEntityInput: BookEntity = { id, title, releaseYear, format, language, price };

    if (description) {
      bookEntityInput = { ...bookEntityInput, description };
    }

    const book = this.entityManager.create(BookEntity, { ...bookEntityInput });

    const savedBook = await this.entityManager.save(book);

    return this.bookMapper.map(savedBook);
  }

  public async findOne(input: FindOnePayload): Promise<Book | null> {
    const { id } = PayloadFactory.create(findOnePayloadSchema, input);

    const bookEntity = await this.entityManager.findOne(BookEntity, { where: { id } });

    if (!bookEntity) {
      return null;
    }

    return this.bookMapper.map(bookEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Book[]> {
    const { authorId, categoryId, filters, pagination } = PayloadFactory.create(findManyPayloadSchema, input);

    let bookQueryBuilder = new BookQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (pagination.page - 1) * pagination.limit;

    if (authorId) {
      bookQueryBuilder = bookQueryBuilder.whereAuthorId(authorId);
    }

    if (categoryId) {
      bookQueryBuilder = bookQueryBuilder.whereCategoryId(categoryId);
    }

    const booksEntities = await bookQueryBuilder
      .where(filters)
      .skip(numberOfEnitiesToSkip)
      .take(pagination.limit)
      .getMany();

    return booksEntities.map((book) => this.bookMapper.map(book));
  }

  public async updateOne(input: UpdateOnePayload): Promise<Book> {
    const {
      id,
      draft: { description, price },
    } = PayloadFactory.create(updateOnePayloadSchema, input);

    const bookEntity = await this.findOne({ id });

    if (!bookEntity) {
      throw new BookNotFoundError({ id });
    }

    let findOneInput = {};

    if (price) {
      findOneInput = { ...findOneInput, price };
    }

    if (description) {
      findOneInput = { ...findOneInput, description };
    }

    await this.entityManager.update(BookEntity, { id }, { ...findOneInput });

    const updatedBookEntity = await this.findOne({ id });

    return updatedBookEntity as Book;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = PayloadFactory.create(deleteOnePayloadSchema, input);

    const bookEntity = await this.findOne({ id });

    if (!bookEntity) {
      throw new BookNotFoundError({ id });
    }

    await this.entityManager.delete(BookEntity, { id });
  }
}
