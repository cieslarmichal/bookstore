import { createOrderDraftSchema } from './createOrderDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createOrderPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createOrderDraftSchema,
});

export type CreateOrderPayload = SchemaType<typeof createOrderPayloadSchema>;
