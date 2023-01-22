import { CreateAuthorBookData } from './createAuthorBookData';
import { RemoveAuthorBookData } from './removeAuthorBookData';
import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Author } from '../../../../author/contracts/author';
import { Book } from '../../../../book/contracts/book';
import { PaginationData } from '../../../../common/paginationData';
import { AuthorBook } from '../../authorBook';

export interface AuthorBookService {
  createAuthorBook(unitOfWork: PostgresUnitOfWork, authorBookData: CreateAuthorBookData): Promise<AuthorBook>;
  findAuthorBooks(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Book[]>;
  findBookAuthors(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Author[]>;
  removeAuthorBook(unitOfWork: PostgresUnitOfWork, authorBookData: RemoveAuthorBookData): Promise<void>;
}
