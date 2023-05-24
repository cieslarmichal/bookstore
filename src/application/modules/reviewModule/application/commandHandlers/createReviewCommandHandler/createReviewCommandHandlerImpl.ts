import { CreateReviewCommandHandler } from './createReviewCommandHandler';
import {
  CreateReviewCommandHandlerPayload,
  createReviewCommandHandlerPayloadSchema,
} from './payloads/createReviewCommandHandlerPayload';
import {
  CreateReviewCommandHandlerResult,
  createReviewCommandHandlerResultSchema,
} from './payloads/createReviewCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { reviewSymbols } from '../../../symbols';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

@Injectable()
export class CreateReviewCommandHandlerImpl implements CreateReviewCommandHandler {
  public constructor(
    @Inject(reviewSymbols.reviewRepositoryFactory)
    private readonly reviewRepositoryFactory: ReviewRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: CreateReviewCommandHandlerPayload): Promise<CreateReviewCommandHandlerResult> {
    const { unitOfWork, draft } = Validator.validate(createReviewCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Creating review...', context: { ...draft } });

    const entityManager = unitOfWork.getEntityManager();

    const reviewRepository = this.reviewRepositoryFactory.create(entityManager);

    const review = await reviewRepository.createReview({ id: UuidGenerator.generateUuid(), ...draft });

    this.loggerService.info({ message: 'Review created.', context: { reviewId: review.id } });

    return Validator.validate(createReviewCommandHandlerResultSchema, { review });
  }
}
