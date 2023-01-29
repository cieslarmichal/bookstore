import { CreateBookCategoryPayload } from './createBookCategoryPayload';
import { DeleteBookCategoryPayload } from './deleteBookCategoryPayload';
import { FindBooksByCategoryIdPayload } from './findBooksByCategoryIdPayload';
import { FindCategoriesByBookIdPayload } from './findCategoriesByBookIdPayload';
import { Book } from '../../../../book/contracts/book';
import { Category } from '../../../../category/contracts/category';
import { BookCategory } from '../../bookCategory';

export interface BookCategoryService {
  createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory>;
  findCategoriesByBookId(input: FindCategoriesByBookIdPayload): Promise<Category[]>;
  findBooksByCategoryId(input: FindBooksByCategoryIdPayload): Promise<Book[]>;
  deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void>;
}
