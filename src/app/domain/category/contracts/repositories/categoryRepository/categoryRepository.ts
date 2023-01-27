import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { Category } from '../../category';
import { CategoryEntity } from '../../categoryEntity';

export interface CategoryRepository {
  createOne(categoryData: Partial<CategoryEntity>): Promise<Category>;
  findOne(conditions: FindConditions<CategoryEntity>): Promise<Category | null>;
  findOneById(id: string): Promise<Category | null>;
  findMany(filters: Filter[], paginationData: PaginationData): Promise<Category[]>;
  findManyByBookId(bookId: string, filters: Filter[], paginationData: PaginationData): Promise<Category[]>;
  updateOne(id: string, categoryData: Partial<CategoryEntity>): Promise<Category>;
  deleteOne(id: string): Promise<void>;
}
