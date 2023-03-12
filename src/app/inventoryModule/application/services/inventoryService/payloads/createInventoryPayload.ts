import { createInventoryDraftSchema } from './createInventoryDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const createInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createInventoryDraftSchema,
});

export type CreateInventoryPayload = SchemaType<typeof createInventoryPayloadSchema>;
