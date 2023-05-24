export const symbols = {
  reviewMapper: Symbol('reviewMapper'),
  reviewRepositoryFactory: Symbol('reviewRepositoryFactory'),
  reviewHttpController: Symbol('reviewHttpController'),
  createReviewCommandHandler: Symbol('createReviewCommandHandler'),
  updateReviewCommandHandler: Symbol('updateReviewCommandHandler'),
  deleteReviewCommandHandler: Symbol('deleteReviewCommandHandler'),
  findReviewQueryHandler: Symbol('findReviewQueryHandler'),
  findReviewsQueryHandler: Symbol('findReviewsQueryHandler'),
};

export const reviewSymbols = {
  reviewRepositoryFactory: symbols.reviewRepositoryFactory,
  reviewHttpController: symbols.reviewHttpController,
};
