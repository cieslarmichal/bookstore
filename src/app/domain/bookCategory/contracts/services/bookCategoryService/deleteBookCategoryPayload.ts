import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteBookCategoryPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly categoryId: string;
  readonly bookId: string;
}
