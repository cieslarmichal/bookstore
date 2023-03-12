import { updateInventoryDraftSchema } from './updateInventoryDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const updateInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.notEmptyString(),
  draft: updateInventoryDraftSchema,
});

export type UpdateInventoryPayload = SchemaType<typeof updateInventoryPayloadSchema>;
