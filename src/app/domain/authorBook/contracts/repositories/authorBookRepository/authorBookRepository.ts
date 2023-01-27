import { FindConditions } from 'typeorm';

import { AuthorBook } from '../../authorBook';
import { AuthorBookEntity } from '../../authorBookEntity';

export interface AuthorBookRepository {
  createOne(authorBookData: Partial<AuthorBookEntity>): Promise<AuthorBook>;
  findOne(conditions: FindConditions<AuthorBookEntity>): Promise<AuthorBook | null>;
  findOneById(id: string): Promise<AuthorBook | null>;
  deleteOne(id: string): Promise<void>;
}
