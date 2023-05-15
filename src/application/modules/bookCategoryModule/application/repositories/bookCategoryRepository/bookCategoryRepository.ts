import { CreateBookCategoryPayload } from './payloads/createBookCategoryPayload';
import { DeleteBookCategoryPayload } from './payloads/deleteBookCategoryPayload';
import { FindBookCategoryPayload } from './payloads/findBookCategoryPayload';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';

export interface BookCategoryRepository {
  createBookCategory(input: CreateBookCategoryPayload): Promise<BookCategory>;
  findBookCategory(input: FindBookCategoryPayload): Promise<BookCategory | null>;
  deleteBookCategory(input: DeleteBookCategoryPayload): Promise<void>;
}
