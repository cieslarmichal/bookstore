import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { BookCategoryDto } from '../dtos';
import { BookCategory } from '../entities/bookCategory';
import { BookCategoryMapper } from '../mappers/bookCategoryMapper';
import { BookCategoryNotFound } from '../errors';

@EntityRepository()
export class BookCategoryRepository {
  public constructor(
    private readonly entityManager: EntityManager,
    private readonly bookCategoryMapper: BookCategoryMapper,
  ) {}

  public async createOne(bookCategoryData: Partial<BookCategory>): Promise<BookCategoryDto> {
    const bookCategory = this.entityManager.create(BookCategory, bookCategoryData);

    const savedBookCategory = await this.entityManager.save(bookCategory);

    return this.bookCategoryMapper.mapEntityToDto(savedBookCategory);
  }

  public async findOne(conditions: FindConditions<BookCategory>): Promise<BookCategoryDto | null> {
    const bookCategory = await this.entityManager.findOne(BookCategory, conditions);

    if (!bookCategory) {
      return null;
    }

    return this.bookCategoryMapper.mapEntityToDto(bookCategory);
  }

  public async findOneById(id: string): Promise<BookCategoryDto | null> {
    return this.findOne({ id });
  }

  public async removeOne(id: string): Promise<void> {
    const bookCategory = await this.findOneById(id);

    if (!bookCategory) {
      throw new BookCategoryNotFound({ id });
    }

    await this.entityManager.delete(BookCategory, { id });
  }
}
