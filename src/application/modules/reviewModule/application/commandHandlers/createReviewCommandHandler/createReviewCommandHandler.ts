import { CreateReviewCommandHandlerPayload } from './payloads/createReviewCommandHandlerPayload';
import { CreateReviewCommandHandlerResult } from './payloads/createReviewCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type CreateReviewCommandHandler = CommandHandler<
  CreateReviewCommandHandlerPayload,
  CreateReviewCommandHandlerResult
>;
