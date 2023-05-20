export const symbols = {
  inventoryMapper: Symbol('inventoryMapper'),
  inventoryRepositoryFactory: Symbol('inventoryRepositoryFactory'),
  inventoryHttpController: Symbol('inventoryHttpController'),
  createInventoryCommandHandler: Symbol('createInventoryCommandHandler'),
  updateInventoryCommandHandler: Symbol('updateInventoryCommandHandler'),
  deleteInventoryCommandHandler: Symbol('deleteInventoryCommandHandler'),
  findInventoryQueryHandler: Symbol('findInventoryQueryHandler'),
  findInventoriesQueryHandler: Symbol('findInventoriesQueryHandler'),
};

export const inventorySymbols = {
  inventoryRepositoryFactory: symbols.inventoryRepositoryFactory,
  inventoryHttpController: symbols.inventoryHttpController,
  findInventoryQueryHandler: symbols.findInventoryQueryHandler,
  updateInventoryCommandHandler: symbols.updateInventoryCommandHandler,
};
