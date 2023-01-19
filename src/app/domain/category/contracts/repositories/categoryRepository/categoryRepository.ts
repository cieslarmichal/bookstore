import { FindConditions } from 'typeorm';
import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { CategoryEntity } from '../../categoryEntity';
import { Category } from '../../category';

export interface CategoryRepository {
  createOne(categoryData: Partial<CategoryEntity>): Promise<Category>;
  findOne(conditions: FindConditions<CategoryEntity>): Promise<Category | null>;
  findOneById(id: string): Promise<Category | null>;
  findMany(filters: Filter[], paginationData: PaginationData): Promise<Category[]>;
  findManyByBookId(bookId: string, filters: Filter[], paginationData: PaginationData): Promise<Category[]>;
  updateOne(id: string, categoryData: Partial<CategoryEntity>): Promise<Category>;
  removeOne(id: string): Promise<void>;
}
