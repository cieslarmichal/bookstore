import { createBookDraftSchema } from './createBookDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createBookCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createBookDraftSchema,
});

export type CreateBookCommandHandlerPayload = SchemaType<typeof createBookCommandHandlerPayloadSchema>;
