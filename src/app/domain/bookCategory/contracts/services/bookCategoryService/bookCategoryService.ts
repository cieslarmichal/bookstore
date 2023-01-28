import { CreateBookCategoryData } from './createBookCategoryData';
import { RemoveBookCategoryData } from './removeBookCategoryData';
import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Book } from '../../../../book/contracts/book';
import { Category } from '../../../../category/contracts/category';
import { PaginationData } from '../../../../common/paginationData';
import { BookCategory } from '../../bookCategory';

export interface BookCategoryService {
  createBookCategory(unitOfWork: PostgresUnitOfWork, bookCategoryData: CreateBookCategoryData): Promise<BookCategory>;
  findCategoriesOfBook(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    pagination: PaginationData,
  ): Promise<Category[]>;
  findBooksFromCategory(
    unitOfWork: PostgresUnitOfWork,
    categoryId: string,
    filters: Filter[],
    pagination: PaginationData,
  ): Promise<Book[]>;
  removeBookCategory(unitOfWork: PostgresUnitOfWork, bookCategoryData: RemoveBookCategoryData): Promise<void>;
}
