export const symbols = {
  userModuleConfig: Symbol('userModuleConfig'),
  userMapper: Symbol('userMapper'),
  userRepositoryFactory: Symbol('userRepositoryFactory'),
  hashService: Symbol('hashService'),
  tokenService: Symbol('tokenService'),
  userHttpController: Symbol('userHttpController'),
  registerUserCommandHandler: Symbol('registerUserCommandHandler'),
  loginUserCommandHandler: Symbol('loginUserCommandHandler'),
  setUserPasswordCommandHandler: Symbol('setUserPasswordCommandHandler'),
  setUserEmailCommandHandler: Symbol('setUserEmailCommandHandler'),
  setUserPhoneNumberCommandHandler: Symbol('setUserPhoneNumberCommandHandler'),
  deleteUserCommandHandler: Symbol('deleteUserCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
};

export const userSymbols = {
  userRepositoryFactory: symbols.userRepositoryFactory,
  userHttpController: symbols.userHttpController,
  tokenService: symbols.tokenService,
};
