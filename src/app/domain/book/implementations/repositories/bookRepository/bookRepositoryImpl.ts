import { EntityManager } from 'typeorm';

import { BookQueryBuilder } from './bookQueryBuilder';
import { Book } from '../../../contracts/book';
import { BookEntity } from '../../../contracts/bookEntity';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';
import { BookRepository } from '../../../contracts/repositories/bookRepository/bookRepository';
import { CreateOnePayload } from '../../../contracts/repositories/bookRepository/createOnePayload';
import { DeleteOnePayload } from '../../../contracts/repositories/bookRepository/deleteOnePayload';
import { FindManyPayload } from '../../../contracts/repositories/bookRepository/findManyPayload';
import { FindOnePayload } from '../../../contracts/repositories/bookRepository/findOnePayload';
import { UpdateOnePayload } from '../../../contracts/repositories/bookRepository/updateOnePayload';
import { BookNotFoundError } from '../../../errors/bookNotFoundError';

export class BookRepositoryImpl implements BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createOne(input: CreateOnePayload): Promise<Book> {
    const bookEntityInput: BookEntity = input;

    const book = this.entityManager.create(BookEntity, { ...bookEntityInput });

    const savedBook = await this.entityManager.save(book);

    return this.bookMapper.map(savedBook);
  }

  public async findOne(input: FindOnePayload): Promise<Book | null> {
    const { id } = input;

    const bookEntity = await this.entityManager.findOne(BookEntity, { where: { id } });

    if (!bookEntity) {
      return null;
    }

    return this.bookMapper.map(bookEntity);
  }

  public async findMany(input: FindManyPayload): Promise<Book[]> {
    const { authorId, categoryId, filters, pagination } = input;

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
    const { id, draft } = input;

    const bookEntity = await this.findOne({ id });

    if (!bookEntity) {
      throw new BookNotFoundError({ id });
    }

    await this.entityManager.update(BookEntity, { id }, { ...draft });

    const updatedBookEntity = await this.findOne({ id });

    return updatedBookEntity as Book;
  }

  public async deleteOne(input: DeleteOnePayload): Promise<void> {
    const { id } = input;

    const bookEntity = await this.findOne({ id });

    if (!bookEntity) {
      throw new BookNotFoundError({ id });
    }

    await this.entityManager.delete(BookEntity, { id });
  }
}
