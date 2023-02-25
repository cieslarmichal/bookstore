import { createOrderDraftSchema } from './createOrderDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createOrderPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createOrderDraftSchema,
});

export type CreateOrderPayload = SchemaType<typeof createOrderPayloadSchema>;
