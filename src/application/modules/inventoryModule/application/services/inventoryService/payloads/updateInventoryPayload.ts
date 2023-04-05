import { updateInventoryDraftSchema } from './updateInventoryDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const updateInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.string(),
  draft: updateInventoryDraftSchema,
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
