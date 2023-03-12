import { updateBookDraftSchema } from './updateBookDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const updateBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.notEmptyString(),
  draft: updateBookDraftSchema,
});

export type UpdateBookPayload = SchemaType<typeof updateBookPayloadSchema>;
