import { CreateBookCategoryPayload } from './payloads/createBookCategoryPayload';
import { DeleteBookCategoryPayload } from './payloads/deleteBookCategoryPayload';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';

export interface BookCategoryService {
  createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory>;
  deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void>;
}
