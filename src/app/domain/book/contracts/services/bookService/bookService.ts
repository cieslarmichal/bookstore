import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { BookDto } from '../../bookDto';
import { CreateBookData } from './createBookData';
import { UpdateBookData } from './updateBookData';

export interface BookService {
  createBook(unitOfWork: PostgresUnitOfWork, bookData: CreateBookData): Promise<BookDto>;
  findBook(unitOfWork: PostgresUnitOfWork, bookId: string): Promise<BookDto>;
  findBooks(unitOfWork: PostgresUnitOfWork, filters: Filter[], paginationData: PaginationData): Promise<BookDto[]>;
  findBooksByAuthorId(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]>;
  findBooksByCategoryId(
    unitOfWork: PostgresUnitOfWork,
    categoryId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]>;
  updateBook(unitOfWork: PostgresUnitOfWork, bookId: string, bookData: UpdateBookData): Promise<BookDto>;
  removeBook(unitOfWork: PostgresUnitOfWork, bookId: string): Promise<void>;
}
