export const symbols = {
  authorMapper: Symbol('authorMapper'),
  authorRepositoryFactory: Symbol('authorRepositoryFactory'),
  authorHttpController: Symbol('authorHttpController'),
  createAuthorCommandHandler: Symbol('createAuthorCommandHandler'),
  updateAuthorCommandHandler: Symbol('updateAuthorCommandHandler'),
  deleteAuthorCommandHandler: Symbol('deleteAuthorCommandHandler'),
  findAuthorQueryHandler: Symbol('findAuthorQueryHandler'),
  findAuthorsQueryHandler: Symbol('findAuthorsQueryHandler'),
  findAuthorsByBookIdQueryHandler: Symbol('findAuthorsByBookIdQueryHandler'),
};

export const authorSymbols = {
  authorHttpController: symbols.authorHttpController,
  authorRepositoryFactory: symbols.authorRepositoryFactory,
  findAuthorsByBookIdQueryHandler: symbols.findAuthorsByBookIdQueryHandler,
  findAuthorQueryHandler: symbols.findAuthorQueryHandler,
};
