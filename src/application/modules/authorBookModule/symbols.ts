export const symbols = {
  authorBookMapper: Symbol('authorBookMapper'),
  authorBookRepositoryFactory: Symbol('authorBookRepositoryFactory'),
  authorBookHttpController: Symbol('authorBookHttpController'),
  createAuthorBookCommandHandler: Symbol('createAuthorBookCommandHandler'),
  deleteAuthorBookCommandHandler: Symbol('deleteAuthorBookCommandHandler'),
};

export const authorBookSymbols = {
  authorBookHttpController: symbols.authorBookHttpController,
  authorBookRepositoryFactory: symbols.authorBookRepositoryFactory,
};
