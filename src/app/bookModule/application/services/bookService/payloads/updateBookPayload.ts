import { updateBookDraftSchema } from './updateBookDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const updateBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.notEmptyString(),
  draft: updateBookDraftSchema,
});

export type UpdateBookPayload = SchemaType<typeof updateBookPayloadSchema>;
