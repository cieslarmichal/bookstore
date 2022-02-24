import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { BookDto } from '../dtos';
import { Book } from '../entities/book';
import { BookMapper } from '../mappers/bookMapper';
import { NotFoundError } from '../../../shared';

@EntityRepository()
export class BookRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly bookMapper: BookMapper) {}

  public async createOne(bookData: Partial<Book>): Promise<BookDto> {
    const { title, author } = bookData;

    const existingBook = await this.findOne({ title, author });

    if (existingBook) {
      throw new Error(`Book with title ${title} and author ${author} already exists`);
    }

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

  public async findOneById(id: number): Promise<BookDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<Book>): Promise<BookDto[]> {
    const books = await this.entityManager.find(Book, conditions);

    return books.map((book) => this.bookMapper.mapEntityToDto(book));
  }

  public async updateOne(id: number, bookData: Partial<Book>): Promise<BookDto> {
    const book = await this.findOneById(id);

    if (!book) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }

    await this.entityManager.update(Book, { id }, bookData);

    return this.findOneById(id) as Promise<BookDto>;
  }

  public async removeOne(id: number): Promise<void> {
    const book = await this.findOneById(id);

    if (!book) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }

    await this.entityManager.delete(Book, { id });
  }
}
