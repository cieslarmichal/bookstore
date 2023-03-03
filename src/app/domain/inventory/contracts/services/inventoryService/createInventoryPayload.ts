import { createInventoryDraftSchema } from './createInventoryDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createInventoryDraftSchema,
});

export type CreateInventoryPayload = SchemaType<typeof createInventoryPayloadSchema>;
