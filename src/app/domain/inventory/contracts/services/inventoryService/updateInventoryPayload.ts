import { updateInventoryDraftSchema } from './updateInventoryDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const updateInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.notEmptyString(),
  draft: updateInventoryDraftSchema,
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
