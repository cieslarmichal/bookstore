import { updateBookDraftSchema } from './updateBookDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const updateBookPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.notEmptyString(),
  draft: updateBookDraftSchema,
});

export type UpdateBookPayload = SchemaType<typeof updateBookPayloadSchema>;
