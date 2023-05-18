import { CreateCategoryPayload } from './payloads/createCategoryPayload';
import { DeleteCategoryPayload } from './payloads/deleteCategoryPayload';
import { FindCategoriesPayload } from './payloads/findCategoriesPayload';
import { FindCategoryPayload } from './payloads/findCategoryPayload';
import { Category } from '../../../domain/entities/category/category';

export interface CategoryRepository {
  createCategory(input: CreateCategoryPayload): Promise<Category>;
  findCategory(input: FindCategoryPayload): Promise<Category | null>;
  findCategories(input: FindCategoriesPayload): Promise<Category[]>;
  deleteCategory(input: DeleteCategoryPayload): Promise<void>;
}
