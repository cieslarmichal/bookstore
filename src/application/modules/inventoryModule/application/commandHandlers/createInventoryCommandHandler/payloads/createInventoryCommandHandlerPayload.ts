import { createInventoryDraftSchema } from './createInventoryDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createInventoryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createInventoryDraftSchema,
});

export type CreateInventoryCommandHandlerPayload = SchemaType<typeof createInventoryCommandHandlerPayloadSchema>;
