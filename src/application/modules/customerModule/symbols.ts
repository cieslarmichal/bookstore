export const symbols = {
  customerMapper: Symbol('customerMapper'),
  customerRepositoryFactory: Symbol('customerRepositoryFactory'),
  customerHttpController: Symbol('customerHttpController'),
  createCustomerCommandHandler: Symbol('createCustomerCommandHandler'),
  deleteCustomerCommandHandler: Symbol('deleteCustomerCommandHandler'),
  findCustomerQueryHandler: Symbol('findCustomerQueryHandler'),
};

export const customerSymbols = {
  customerRepositoryFactory: symbols.customerRepositoryFactory,
  customerHttpController: symbols.customerHttpController,
  findCustomerQueryHandler: symbols.findCustomerQueryHandler,
};
