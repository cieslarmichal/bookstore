export const orderModuleSymbols = {
  orderMapper: Symbol('orderMapper'),
  orderRepositoryFactory: Symbol('orderRepositoryFactory'),
  orderService: Symbol('orderService'),
  cartValidatorService: Symbol('cartValidatorService'),
  orderController: Symbol('orderController'),

  cartMapper: Symbol('cartMapper'),
  cartRepositoryFactory: Symbol('cartRepositoryFactory'),
  cartService: Symbol('cartService'),
  cartController: Symbol('cartController'),

  lineItemMapper: Symbol('lineItemMapper'),
  lineItemRepositoryFactory: Symbol('lineItemRepositoryFactory'),
};
