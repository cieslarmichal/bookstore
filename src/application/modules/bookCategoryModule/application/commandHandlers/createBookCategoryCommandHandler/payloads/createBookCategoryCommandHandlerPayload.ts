import { createBookCategoryDraftSchema } from './createBookCategoryDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createBookCategoryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createBookCategoryDraftSchema,
});

export type CreateBookCategoryCommandHandlerPayload = SchemaType<typeof createBookCategoryCommandHandlerPayloadSchema>;
