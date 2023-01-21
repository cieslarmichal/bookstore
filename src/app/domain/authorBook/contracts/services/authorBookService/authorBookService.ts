import { Filter } from '../../../../../common/filter/filter';
import { AuthorBookDto } from '../../../../../integrations/authorBook/dtos';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { Author } from '../../../../author/contracts/author';
import { BookDto } from '../../../../book/dtos';
import { PaginationData } from '../../../../common/paginationData';
import { CreateAuthorBookData } from './createAuthorBookData';
import { RemoveAuthorBookData } from './removeAuthorBookData';

export interface AuthorBookService {
  createAuthorBook(unitOfWork: PostgresUnitOfWork, authorBookData: CreateAuthorBookData): Promise<AuthorBookDto>;
  findAuthorBooks(
    unitOfWork: PostgresUnitOfWork,
    authorId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<BookDto[]>;
  findBookAuthors(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Author[]>;
  removeAuthorBook(unitOfWork: PostgresUnitOfWork, authorBookData: RemoveAuthorBookData): Promise<void>;
}
