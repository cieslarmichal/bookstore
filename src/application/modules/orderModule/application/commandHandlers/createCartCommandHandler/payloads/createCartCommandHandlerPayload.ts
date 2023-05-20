import { createCartDraftSchema } from './createCartDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCartCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCartDraftSchema,
});

export type CreateCartCommandHandlerPayload = SchemaType<typeof createCartCommandHandlerPayloadSchema>;
