import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { BookDto } from '../dtos';
import { Book } from '../entities/book';
import { BookMapper } from '../mappers/bookMapper';
import { BookNotFound } from '../errors';
import { PaginationData } from '../../shared';
import { FindBooksData } from './types';

@EntityRepository()
export class BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createOne(bookData: Partial<Book>): Promise<BookDto> {
    const book = this.entityManager.create(Book, bookData);

    const savedBook = await this.entityManager.save(book);

    return this.bookMapper.mapEntityToDto(savedBook);
  }

  public async findOne(conditions: FindConditions<Book>): Promise<BookDto | null> {
    const book = await this.entityManager.findOne(Book, conditions);

    if (!book) {
      return null;
    }

    return this.bookMapper.mapEntityToDto(book);
  }

  public async findOneById(id: string): Promise<BookDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindBooksData, paginationData: PaginationData): Promise<BookDto[]> {
    const queryBuilder = this.entityManager.getRepository(Book).createQueryBuilder('book');

    const numberOfEnitiesToSkip = (paginationData.page - 1) * paginationData.limit;

    const books = await queryBuilder.where(conditions).skip(numberOfEnitiesToSkip).take(paginationData.limit).getMany();

    return books.map((book) => this.bookMapper.mapEntityToDto(book));
  }

  public async findManyByAuthorId(authorId: string): Promise<BookDto[]> {
    const queryBuilder = this.entityManager.getRepository(Book).createQueryBuilder('book');

    const books = await queryBuilder
      .leftJoinAndSelect('book.authorBooks', 'authorBooks')
      .leftJoinAndSelect('authorBooks.author', 'author')
      .where('author.id = :authorId', { authorId })
      .getMany();

    return books.map((book) => this.bookMapper.mapEntityToDto(book));
  }

  public async findManyByCategoryId(categoryId: string): Promise<BookDto[]> {
    const queryBuilder = this.entityManager.getRepository(Book).createQueryBuilder('book');

    const books = await queryBuilder
      .leftJoinAndSelect('book.bookCategories', 'bookCategories')
      .leftJoinAndSelect('bookCategories.category', 'category')
      .where('category.id = :categoryId', { categoryId })
      .getMany();

    return books.map((book) => this.bookMapper.mapEntityToDto(book));
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
