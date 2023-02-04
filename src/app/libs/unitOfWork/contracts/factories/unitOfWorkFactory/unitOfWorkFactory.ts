import { UnitOfWork } from '../../unitOfWork';

export interface UnitOfWorkFactory {
  create(): Promise<UnitOfWork>;
}
