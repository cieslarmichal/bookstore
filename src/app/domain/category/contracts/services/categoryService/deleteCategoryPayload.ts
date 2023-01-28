import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';

export interface DeleteCategoryPayload {
  readonly unitOfWork: PostgresUnitOfWork;
  readonly categoryId: string;
}
