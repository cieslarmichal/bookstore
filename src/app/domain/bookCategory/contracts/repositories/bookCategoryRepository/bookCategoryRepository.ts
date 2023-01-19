import { FindConditions } from 'typeorm';
import { BookCategoryEntity } from '../../bookCategoryEntity';
import { BookCategory } from '../../bookCategory';

export interface BookCategoryRepository {
  createOne(bookCategoryData: Partial<BookCategoryEntity>): Promise<BookCategory>;
  findOne(conditions: FindConditions<BookCategoryEntity>): Promise<BookCategory | null>;
  findOneById(id: string): Promise<BookCategory | null>;
  removeOne(id: string): Promise<void>;
}
