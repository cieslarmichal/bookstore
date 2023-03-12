export type TransactionCallback<Result, UnitOfWork> = (unitOfWork: UnitOfWork) => Promise<Result>;
