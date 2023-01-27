import { FindConditions } from 'typeorm';

import { BookCategory } from '../../bookCategory';
import { BookCategoryEntity } from '../../bookCategoryEntity';

export interface BookCategoryRepository {
  createOne(bookCategoryData: Partial<BookCategoryEntity>): Promise<BookCategory>;
  findOne(conditions: FindConditions<BookCategoryEntity>): Promise<BookCategory | null>;
  findOneById(id: string): Promise<BookCategory | null>;
  deleteOne(id: string): Promise<void>;
}
