import { Service } from 'typedi';
import { EntityRepository, FindConditions, getRepository } from 'typeorm';
import { BookDto } from '../dtos';
import { Book } from '../entities/book';

@Service()
@EntityRepository()
export class BookRepository {
  public async createOne(bookData: Partial<Book>): Promise<BookDto> {
    const repo = getRepository(Book);

    const { title, author } = bookData;

    const existingBook = this.findOne({ title, author });

    if (existingBook) {
      throw new Error(
        `Book with title ${title} and author ${author} already exist`,
      );
    }

    const book = repo.create(bookData);

    const savedBook = await repo.save(book);

    return savedBook;
  }

  public async findOne(
    conditions: FindConditions<Book>,
  ): Promise<BookDto | null> {
    const repo = getRepository(Book);

    const book = await repo.findOne(conditions);

    if (!book) {
      return null;
    }

    return book;
  }

  public async findOneById(id: string): Promise<BookDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<Book>): Promise<BookDto[]> {
    const repo = getRepository(Book);

    const books = await repo.find(conditions);

    return books;
  }

  public async updateOne(
    id: string,
    bookData: Partial<Book>,
  ): Promise<BookDto> {
    const repo = getRepository(Book);

    const book = await this.findOneById(id);

    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    await repo.update({ id }, bookData);

    return this.findOneById(id);
  }

  public async removeOne(id: string): Promise<void> {
    const repo = getRepository(Book);

    const book = await this.findOneById(id);

    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    await repo.delete({ id });
  }
}
