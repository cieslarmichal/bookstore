import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { BookEntity } from '../../../contracts/bookEntity';
import { Book } from '../../../contracts/book';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';
import { BookRepository } from '../../../contracts/repositories/bookRepository/bookRepository';
import { BookNotFound } from '../../../errors/bookNotFound';
import { BookQueryBuilder } from './bookQueryBuilder';

@EntityRepository()
export class BookRepositoryImpl implements BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createOne(bookData: Partial<BookEntity>): Promise<Book> {
    const book = this.entityManager.create(BookEntity, bookData);

    const savedBook = await this.entityManager.save(book);

    return this.bookMapper.map(savedBook);
  }

  public async findOne(conditions: FindConditions<BookEntity>): Promise<Book | null> {
    const book = await this.entityManager.findOne(BookEntity, conditions);

    if (!book) {
      return null;
    }

    return this.bookMapper.map(book);
  }

  public async findOneById(id: string): Promise<Book | null> {
    return this.findOne({ id });
  }

  public async findMany(filters: Filter[], paginationData: PaginationData): Promise<Book[]> {
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
  ): Promise<Book[]> {
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
  ): Promise<Book[]> {
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

  public async updateOne(id: string, bookData: Partial<BookEntity>): Promise<Book> {
    const book = await this.findOneById(id);

    if (!book) {
      throw new BookNotFound({ id });
    }

    await this.entityManager.update(BookEntity, { id }, bookData);

    return this.findOneById(id) as Promise<Book>;
  }

  public async removeOne(id: string): Promise<void> {
    const book = await this.findOneById(id);

    if (!book) {
      throw new BookNotFound({ id });
    }

    await this.entityManager.delete(BookEntity, { id });
  }
}
