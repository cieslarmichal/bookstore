import { updateInventoryDraftSchema } from './updateInventoryDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const updateInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.notEmptyString(),
  draft: updateInventoryDraftSchema,
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
