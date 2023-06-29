import { EntityManager } from 'typeorm';

import { BookEntity } from './bookEntity/bookEntity';
import { BookMapper } from './bookMapper/bookMapper';
import { BookQueryBuilder } from './bookQueryBuilder';
import { Validator } from '../../../../../../libs/validator/validator';
import { BookNotFoundError } from '../../../application/errors/bookNotFoundError';
import { BookRepository } from '../../../application/repositories/bookRepository/bookRepository';
import {
  CreateBookPayload,
  createBookPayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/createBookPayload';
import {
  DeleteBookPayload,
  deleteBookPayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/deleteBookPayload';
import {
  FindBookPayload,
  findBookPayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/findBookPayload';
import {
  FindBooksPayload,
  findBooksPayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/findBooksPayload';
import {
  UpdateBookPayload,
  updateBookPayloadSchema,
} from '../../../application/repositories/bookRepository/payloads/updateBookPayload';
import { Book } from '../../../domain/entities/book/book';

export class BookRepositoryImpl implements BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createBook(input: CreateBookPayload): Promise<Book> {
    const { id, title, isbn, releaseYear, format, language, price, description } = Validator.validate(
      createBookPayloadSchema,
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

  public async findBook(input: FindBookPayload): Promise<Book | null> {
    const { id } = Validator.validate(findBookPayloadSchema, input);

    const bookEntity = await this.entityManager.findOne(BookEntity, { where: { id } });

    if (!bookEntity) {
      return null;
    }

    return this.bookMapper.map(bookEntity);
  }

  public async findBooks(input: FindBooksPayload): Promise<Book[]> {
    const { authorId, categoryId, filters, pagination } = Validator.validate(findBooksPayloadSchema, input);

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

  public async updateBook(input: UpdateBookPayload): Promise<Book> {
    const {
      id,
      draft: { description, price },
    } = Validator.validate(updateBookPayloadSchema, input);

    const bookEntity = await this.findBook({ id });

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

    const updatedBookEntity = await this.findBook({ id });

    return updatedBookEntity as Book;
  }

  public async deleteBook(input: DeleteBookPayload): Promise<void> {
    const { id } = Validator.validate(deleteBookPayloadSchema, input);

    const bookEntity = await this.findBook({ id });

    if (!bookEntity) {
      throw new BookNotFoundError({ id });
    }

    await this.entityManager.delete(BookEntity, { id });
  }
}
