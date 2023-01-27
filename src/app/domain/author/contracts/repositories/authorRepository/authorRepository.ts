import { FindConditions } from 'typeorm';

import { Filter } from '../../../../../common/filter/filter';
import { PaginationData } from '../../../../common/paginationData';
import { Author } from '../../author';

export interface AuthorRepository {
  createOne(authorData: Partial<Author>): Promise<Author>;
  findOne(conditions: FindConditions<Author>): Promise<Author | null>;
  findOneById(id: string): Promise<Author | null>;
  findMany(filters: Filter[], paginationData: PaginationData): Promise<Author[]>;
  findManyByBookId(bookId: string, filters: Filter[], paginationData: PaginationData): Promise<Author[]>;
  updateOne(id: string, authorData: Partial<Author>): Promise<Author>;
  deleteOne(id: string): Promise<void>;
}
