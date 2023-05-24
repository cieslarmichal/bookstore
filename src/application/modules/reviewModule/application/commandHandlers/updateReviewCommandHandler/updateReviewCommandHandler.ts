import { UpdateReviewCommandHandlerPayload } from './payloads/updateReviewCommandHandlerPayload';
import { UpdateReviewCommandHandlerResult } from './payloads/updateReviewCommandHandlerResult';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type UpdateReviewCommandHandler = CommandHandler<
  UpdateReviewCommandHandlerPayload,
  UpdateReviewCommandHandlerResult
>;
