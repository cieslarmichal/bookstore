import { Filter } from '../../../../../common/filter/filter';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { PaginationData } from '../../../../common/paginationData';
import { Author } from '../../author';
import { CreateAuthorData } from './createAuthorData';
import { UpdateAuthorData } from './updateAuthorData';

export interface AuthorService {
  createAuthor(unitOfWork: PostgresUnitOfWork, authorData: CreateAuthorData): Promise<Author>;
  findAuthor(unitOfWork: PostgresUnitOfWork, authorId: string): Promise<Author>;
  findAuthors(unitOfWork: PostgresUnitOfWork, filters: Filter[], paginationData: PaginationData): Promise<Author[]>;
  findAuthorsByBookId(
    unitOfWork: PostgresUnitOfWork,
    bookId: string,
    filters: Filter[],
    paginationData: PaginationData,
  ): Promise<Author[]>;
  updateAuthor(unitOfWork: PostgresUnitOfWork, authorId: string, authorData: UpdateAuthorData): Promise<Author>;
  removeAuthor(unitOfWork: PostgresUnitOfWork, authorId: string): Promise<void>;
}
