import { CreateBookCategoryPayload } from './payloads/createBookCategoryPayload';
import { DeleteBookCategoryPayload } from './payloads/deleteBookCategoryPayload';
import { FindBooksByCategoryIdPayload } from './payloads/findBooksByCategoryIdPayload';
import { FindCategoriesByBookIdPayload } from './payloads/findCategoriesByBookIdPayload';
import { Book } from '../../../../bookModule/domain/entities/book/book';
import { Category } from '../../../../categoryModule/domain/entities/category/category';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';

export interface BookCategoryService {
  createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory>;
  findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]>;
  findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]>;
  deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void>;
}
