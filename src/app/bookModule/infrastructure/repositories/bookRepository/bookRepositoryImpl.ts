import { EntityManager } from 'typeorm';

import { BookEntity } from './bookEntity/bookEntity';
import { BookMapper } from './bookMapper/bookMapper';
import { BookQueryBuilder } from './bookQueryBuilder';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { BookRepository } from '../../../application/repositories/bookRepository/bookRepository';
import {
  CreateOnePayload,
  createOnePayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/createOnePayload';
import {
  DeleteOnePayload,
  deleteOnePayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/deleteOnePayload';
import {
  FindManyPayload,
  findManyPayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/findManyPayload';
import {
  FindOnePayload,
  findOnePayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/findOnePayload';
import {
  UpdateOnePayload,
  updateOnePayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/updateOnePayload';
import { Book } from '../../../domain/entities/book/book';
import { BookNotFoundError } from '../../errors/bookNotFoundError';

export class BookRepositoryImpl implements BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Book> {
    const { id, title, isbn, releaseYear, format, language, price, description } = Validator.validate(
      createOnePayloadSchema,
      input,
    );

    let bookEntityInput: BookEntity = { id, title, isbn, releaseYear, format, language, price };

    if (description) {
      bookEntityInput = { ...bookEntityInput, description };
    }

    const book = this.entityManager.create(BookEntity, { ...bookEntityInput });

    const savedBook = await this.entityManager.save(book);

    return this.bookMapper.map(savedBook);
  }

  public async findOne(input: FindOnePayload): Promise<Book | null> {
    const { id } = Validator.validate(findOnePayloadSchema, input);

    const bookEntity = await this.entityManager.findOne(BookEntity, { where: { id } });

    if (!bookEntity) {
      return null;
    }

    return this.bookMapper.map(bookEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Book[]> {
    const { authorId, categoryId, filters, pagination } = Validator.validate(findManyPayloadSchema, input);

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
    } = Validator.validate(updateOnePayloadSchema, input);

    const bookEntity = await this.findOne({ id });

    if (!bookEntity) {
      throw new BookNotFoundError({ id });
    }

    let updateOneInput = {};

    if (price !== undefined) {
      updateOneInput = { ...updateOneInput, price };
    }

    if (description) {
      updateOneInput = { ...updateOneInput, description };
    }

    await this.entityManager.update(BookEntity, { id }, { ...updateOneInput });

    const updatedBookEntity = await this.findOne({ id });

    return updatedBookEntity as Book;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = Validator.validate(deleteOnePayloadSchema, input);

    const bookEntity = await this.findOne({ id });

    if (!bookEntity) {
      throw new BookNotFoundError({ id });
    }

    await this.entityManager.delete(BookEntity, { id });
  }
}
