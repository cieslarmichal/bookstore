import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Book } from '../../book';
import { CreateBookData } from './createBookData';
import { UpdateBookData } from './updateBookData';

export interface BookService {
  createBook(unitOfWork: PostgresUnitOfWork, bookData: CreateBookData): Promise<Book>;
  findBook(unitOfWork: PostgresUnitOfWork, bookId: string): Promise<Book>;
  findBooks(unitOfWork: PostgresUnitOfWork, filters: Filter[], paginationData: PaginationData): Promise<Book[]>;
  findBooksByAuthorId(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Book[]>;
  findBooksByCategoryId(
    unitOfWork: PostgresUnitOfWork,
    categoryId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Book[]>;
  updateBook(unitOfWork: PostgresUnitOfWork, bookId: string, bookData: UpdateBookData): Promise<Book>;
  removeBook(unitOfWork: PostgresUnitOfWork, bookId: string): Promise<void>;
}
