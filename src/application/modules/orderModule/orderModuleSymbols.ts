export const orderModuleSymbols = {
  orderMapper: Symbol('orderMapper'),
  orderRepositoryFactory: Symbol('orderRepositoryFactory'),
  orderService: Symbol('orderService'),
  cartValidatorService: Symbol('cartValidatorService'),
  orderHttpController: Symbol('orderHttpController'),

  cartMapper: Symbol('cartMapper'),
  cartRepositoryFactory: Symbol('cartRepositoryFactory'),
  cartService: Symbol('cartService'),
  cartHttpController: Symbol('cartHttpController'),

  lineItemMapper: Symbol('lineItemMapper'),
  lineItemRepositoryFactory: Symbol('lineItemRepositoryFactory'),
};
