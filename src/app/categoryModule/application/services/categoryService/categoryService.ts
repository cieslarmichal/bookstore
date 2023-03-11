import { CreateCategoryPayload } from './createCategoryPayload';
import { DeleteCategoryPayload } from './payloads/deleteCategoryPayload';
import { FindCategoriesByBookIdPayload } from './payloads/findCategoriesByBookIdPayload';
import { FindCategoriesPayload } from './payloads/findCategoriesPayload';
import { FindCategoryPayload } from './payloads/findCategoryPayload';
import { Category } from '../../../domain/entities/category/category';

export interface CategoryService {
  createCategory(input: CreateCategoryPayload): Promise<Category>;
  findCategory(input: FindCategoryPayload): Promise<Category>;
  findCategories(input: FindCategoriesPayload): Promise<Category[]>;
  findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]>;
  deleteCategory(input: DeleteCategoryPayload): Promise<void>;
}
