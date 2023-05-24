import { DeleteReviewCommandHandlerPayload } from './payloads/deleteReviewCommandHandlerPayload';
import { CommandHandler } from '../../../../../../common/types/commandHandler';

export type DeleteReviewCommandHandler = CommandHandler<DeleteReviewCommandHandlerPayload, void>;
