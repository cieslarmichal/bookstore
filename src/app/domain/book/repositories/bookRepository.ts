import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { BookDto } from '../dtos';
import { Book } from '../entities/book';
import { BookMapper } from '../mappers/bookMapper';
import { BookNotFound } from '../errors';
import { PaginationData } from '../../shared';
import { BookQueryBuilder } from './queryBuilder';
import { Filter } from '../../../common';

@EntityRepository()
export class BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createOne(bookData: Partial<Book>): Promise<BookDto> {
    const book = this.entityManager.create(Book, bookData);

    const savedBook = await this.entityManager.save(book);

    return this.bookMapper.map(savedBook);
  }

  public async findOne(conditions: FindConditions<Book>): Promise<BookDto | null> {
    const book = await this.entityManager.findOne(Book, conditions);

    if (!book) {
      return null;
    }

    return this.bookMapper.map(book);
  }

  public async findOneById(id: string): Promise<BookDto | null> {
    return this.findOne({ id });
  }

  public async findMany(filters: Filter[], paginationData: PaginationData): Promise<BookDto[]> {
    const bookQueryBuilder = new BookQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const books = await bookQueryBuilder
      .boookConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return books.map((book) => this.bookMapper.map(book));
  }

  public async findManyByAuthorId(
    authorId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const bookQueryBuilder = new BookQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const books = await bookQueryBuilder
      .authorConditions(authorId)
      .boookConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return books.map((book) => this.bookMapper.map(book));
  }

  public async findManyByCategoryId(
    categoryId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]> {
    const bookQueryBuilder = new BookQueryBuilder(this.entityManager);

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const books = await bookQueryBuilder
      .categoryConditions(categoryId)
      .boookConditions(filters)
      .skip(numberOfEnitiesToSkip)
      .take(paginationData.limit)
      .getMany();

    return books.map((book) => this.bookMapper.map(book));
  }

  public async updateOne(id: string, bookData: Partial<Book>): Promise<BookDto> {
    const book = await this.findOneById(id);

    if (!book) {
      throw new BookNotFound({ id });
    }

    await this.entityManager.update(Book, { id }, bookData);

    return this.findOneById(id) as Promise<BookDto>;
  }

  public async removeOne(id: string): Promise<void> {
    const book = await this.findOneById(id);

    if (!book) {
      throw new BookNotFound({ id });
    }

    await this.entityManager.delete(Book, { id });
  }
}
