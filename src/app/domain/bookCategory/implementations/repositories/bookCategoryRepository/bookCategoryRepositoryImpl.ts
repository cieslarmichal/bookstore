import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategory } from '../../../contracts/bookCategory';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryRepository } from '../../../contracts/repositories/bookCategoryRepository/bookCategoryRepository';
import { BookCategoryNotFound } from '../../../errors/bookCategoryNotFound';

@EntityRepository()
export class BookCategoryRepositoryImpl implements BookCategoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly bookCategoryMapper: BookCategoryMapper,
  ) {}

  public async createOne(bookCategoryData: Partial<BookCategoryEntity>): Promise<BookCategory> {
    const bookCategory = this.entityManager.create(BookCategoryEntity, bookCategoryData);

    const savedBookCategory = await this.entityManager.save(bookCategory);

    return this.bookCategoryMapper.map(savedBookCategory);
  }

  public async findOne(conditions: FindConditions<BookCategoryEntity>): Promise<BookCategory | null> {
    const bookCategory = await this.entityManager.findOne(BookCategoryEntity, conditions);

    if (!bookCategory) {
      return null;
    }

    return this.bookCategoryMapper.map(bookCategory);
  }

  public async findOneById(id: string): Promise<BookCategory | null> {
    return this.findOne({ id });
  }

  public async removeOne(id: string): Promise<void> {
    const bookCategory = await this.findOneById(id);

    if (!bookCategory) {
      throw new BookCategoryNotFound({ id });
    }

    await this.entityManager.delete(BookCategoryEntity, { id });
  }
}
