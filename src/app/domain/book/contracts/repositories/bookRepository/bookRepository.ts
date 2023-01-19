import { FindConditions } from 'typeorm';
import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { BookEntity } from '../../bookEntity';
import { Book } from '../../book';

export interface BookRepository {
  createOne(bookData: Partial<BookEntity>): Promise<Book>;
  findOne(conditions: FindConditions<BookEntity>): Promise<Book | null>;
  findOneById(id: string): Promise<Book | null>;
  findMany(filters: Filter[], paginationData: PaginationData): Promise<Book[]>;
  findManyByAuthorId(authorId: string, filters: Filter[], paginationData: PaginationData): Promise<Book[]>;
  findManyByCategoryId(categoryId: string, filters: Filter[], paginationData: PaginationData): Promise<Book[]>;
  updateOne(id: string, bookData: Partial<BookEntity>): Promise<Book>;
  removeOne(id: string): Promise<void>;
}
