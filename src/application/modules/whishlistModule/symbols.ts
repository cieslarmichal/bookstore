export const symbols = {
  whishlistEntryMapper: Symbol('whishlistEntryMapper'),
  whishlistEntryRepositoryFactory: Symbol('whishlistEntryRepositoryFactory'),
  whishlistHttpController: Symbol('whishlistHttpController'),
  createWhishlistEntryCommandHandler: Symbol('createWhishlistEntryCommandHandler'),
  deleteWhishlistEntryCommandHandler: Symbol('deleteWhishlistEntryCommandHandler'),
  findWhishlistEntryQueryHandler: Symbol('findWhishlistEntryQueryHandler'),
  findWhishlistEntriesQueryHandler: Symbol('findWhishlistEntriesQueryHandler'),
};

export const whishlistSymbols = {
  whishlistEntryRepositoryFactory: symbols.whishlistEntryRepositoryFactory,
  whishlistHttpController: symbols.whishlistHttpController,
};
