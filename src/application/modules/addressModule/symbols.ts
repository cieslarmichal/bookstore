export const symbols = {
  addressMapper: Symbol('addressMapper'),
  addressRepositoryFactory: Symbol('addressRepositoryFactory'),
  createAddressCommandHandler: Symbol('createAddressCommandHandler'),
  updateAddressCommandHandler: Symbol('updateAddressCommandHandler'),
  deleteAddressCommandHandler: Symbol('deleteAddressCommandHandler'),
  findAddressQueryHandler: Symbol('findAddressQueryHandler'),
  findAddressesQueryHandler: Symbol('findAddressesQueryHandler'),
  addressHttpController: Symbol('addressHttpController'),
};

export const addressSymbols = {
  addressHttpController: symbols.addressHttpController,
  addressRepositoryFactory: symbols.addressRepositoryFactory,
};
