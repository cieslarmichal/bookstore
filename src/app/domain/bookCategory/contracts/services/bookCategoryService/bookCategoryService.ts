import { Filter } from '../../../../../common/filter/filter';
import { BookDto } from '../../../../../integrations/book/dtos';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { CategoryDto } from '../../../../category/dtos';
import { PaginationData } from '../../../../common/paginationData';
import { BookCategory } from '../../bookCategory';
import { CreateBookCategoryData } from './createBookCategoryData';
import { RemoveBookCategoryData } from './removeBookCategoryData';

export interface BookCategoryService {
  createBookCategory(unitOfWork: PostgresUnitOfWork, bookCategoryData: CreateBookCategoryData): Promise<BookCategory>;
  findCategoriesOfBook(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<CategoryDto[]>;
  findBooksFromCategory(
    unitOfWork: PostgresUnitOfWork,
    categoryId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]>;
  removeBookCategory(unitOfWork: PostgresUnitOfWork, bookCategoryData: RemoveBookCategoryData): Promise<void>;
}
