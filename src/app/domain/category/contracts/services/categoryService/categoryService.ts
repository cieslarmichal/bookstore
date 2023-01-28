import { CreateCategoryPayload } from './createCategoryPayload';
import { DeleteCategoryPayload } from './deleteCategoryPayload';
import { FindCategoriesByBookIdPayload } from './findCategoriesByBookIdPayload';
import { FindCategoriesPayload } from './findCategoriesPayload';
import { FindCategoryPayload } from './findCategoryPayload';
import { Category } from '../../category';

export interface CategoryService {
  createCategory(input: CreateCategoryPayload): Promise<Category>;
  findCategory(input: FindCategoryPayload): Promise<Category>;
  findCategories(input: FindCategoriesPayload): Promise<Category[]>;
  findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]>;
  deleteCategory(input: DeleteCategoryPayload): Promise<void>;
}
