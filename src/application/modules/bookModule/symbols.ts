export const symbols = {
  bookMapper: Symbol('bookMapper'),
  bookRepositoryFactory: Symbol('bookRepositoryFactory'),
  bookHttpController: Symbol('bookHttpController'),
  createBookCommandHandler: Symbol('createBookCommandHandler'),
  updateBookCommandHandler: Symbol('updateBookCommandHandler'),
  deleteBookCommandHandler: Symbol('deleteBookCommandHandler'),
  findBookQueryHandler: Symbol('findBookQueryHandler'),
  findBooksQueryHandler: Symbol('findBooksQueryHandler'),
};

export const bookSymbols = {
  bookRepositoryFactory: symbols.bookRepositoryFactory,
  bookHttpController: symbols.bookHttpController,
  findBookQueryHandler: symbols.findBookQueryHandler,
};
