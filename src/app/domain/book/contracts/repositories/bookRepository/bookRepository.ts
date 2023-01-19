import { FindConditions } from 'typeorm';
import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { Book } from '../../book';
import { BookDto } from '../../bookDto';

export interface BookRepository {
  createOne(bookData: Partial<Book>): Promise<BookDto>;
  findOne(conditions: FindConditions<Book>): Promise<BookDto | null>;
  findOneById(id: string): Promise<BookDto | null>;
  findMany(filters: Filter[], paginationData: PaginationData): Promise<BookDto[]>;
  findManyByAuthorId(authorId: string, filters: Filter[], paginationData: PaginationData): Promise<BookDto[]>;
  findManyByCategoryId(categoryId: string, filters: Filter[], paginationData: PaginationData): Promise<BookDto[]>;
  updateOne(id: string, bookData: Partial<Book>): Promise<BookDto>;
  removeOne(id: string): Promise<void>;
}
