export const symbols = {
  bookCategoryMapper: Symbol('bookCategoryMapper'),
  bookCategoryRepositoryFactory: Symbol('bookCategoryRepositoryFactory'),
  bookCategoryHttpController: Symbol('bookCategoryHttpController'),
  createBookCategoryCommandHandler: Symbol('createBookCategoryCommandHandler'),
  deleteBookCategoryCommandHandler: Symbol('deleteBookCategoryCommandHandler'),
};

export const bookCategorySymbols = {
  bookCategoryRepositoryFactory: symbols.bookCategoryRepositoryFactory,
  bookCategoryHttpController: symbols.bookCategoryHttpController,
};
