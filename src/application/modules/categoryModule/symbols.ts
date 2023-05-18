export const symbols = {
  categoryMapper: Symbol('categoryMapper'),
  categoryRepositoryFactory: Symbol('categoryRepositoryFactory'),
  categoryHttpController: Symbol('categoryHttpController'),
  createCategoryCommandHandler: Symbol('createCategoryCommandHandler'),
  deleteCategoryCommandHandler: Symbol('deleteCategoryCommandHandler'),
  findCategoryQueryHandler: Symbol('findCategoryQueryHandler'),
  findCategoriesQueryHandler: Symbol('findCategoriesQueryHandler'),
};

export const categorySymbols = {
  categoryRepositoryFactory: symbols.categoryRepositoryFactory,
  categoryHttpController: symbols.categoryHttpController,
};
