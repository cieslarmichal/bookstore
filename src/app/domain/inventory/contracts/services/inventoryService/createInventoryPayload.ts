import { createInventoryDraftSchema } from './createInventoryDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createInventoryDraftSchema,
});

export type CreateInventoryPayload = SchemaType<typeof createInventoryPayloadSchema>;
