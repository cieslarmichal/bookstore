import { createOrderDraftSchema } from './createOrderDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOrderCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createOrderDraftSchema,
});

export type CreateOrderCommandHandlerPayload = SchemaType<typeof createOrderCommandHandlerPayloadSchema>;
