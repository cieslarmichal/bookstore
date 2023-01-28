import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface FindCategoryPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly categoryId: string;
}
