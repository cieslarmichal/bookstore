export const symbols = {
  orderMapper: Symbol('orderMapper'),
  orderRepositoryFactory: Symbol('orderRepositoryFactory'),
  cartValidatorService: Symbol('cartValidatorService'),
  orderHttpController: Symbol('orderHttpController'),
  cartMapper: Symbol('cartMapper'),
  cartRepositoryFactory: Symbol('cartRepositoryFactory'),
  cartHttpController: Symbol('cartHttpController'),
  lineItemMapper: Symbol('lineItemMapper'),
  lineItemRepositoryFactory: Symbol('lineItemRepositoryFactory'),
  createCartCommandHandler: Symbol('createCartCommandHandler'),
  updateCartCommandHandler: Symbol('updateCartCommandHandler'),
  deleteCartCommandHandler: Symbol('deleteCartCommandHandler'),
  addLineItemCommandHandler: Symbol('addLineItemCommandHandler'),
  removeLineItemCommandHandler: Symbol('removeLineItemCommandHandler'),
  findCartQueryHandler: Symbol('findCartQueryHandler'),
  findCartsQueryHandler: Symbol('findCartsQueryHandler'),
  createOrderCommandHandler: Symbol('createOrderCommandHandler'),
  findOrdersQueryHandler: Symbol('findOrdersQueryHandler'),
};

export const orderSymbols = {
  orderRepositoryFactory: symbols.orderRepositoryFactory,
  orderHttpController: symbols.orderHttpController,
  cartRepositoryFactory: symbols.cartRepositoryFactory,
  cartHttpController: symbols.cartHttpController,
  lineItemRepositoryFactory: symbols.lineItemRepositoryFactory,
};
