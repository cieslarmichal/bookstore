import { CreateCategoryData } from './createCategoryData';
import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Category } from '../../category';

export interface CategoryService {
  createCategory(unitOfWork: PostgresUnitOfWork, categoryData: CreateCategoryData): Promise<Category>;
  findCategory(unitOfWork: PostgresUnitOfWork, categoryId: string): Promise<Category>;
  findCategories(
    unitOfWork: PostgresUnitOfWork,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Category[]>;
  findCategoriesByBookId(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Category[]>;
  removeCategory(unitOfWork: PostgresUnitOfWork, categoryId: string): Promise<void>;
}
