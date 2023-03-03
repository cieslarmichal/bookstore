import { createBookCategoryDraftSchema } from './createBookCategoryDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createBookCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createBookCategoryDraftSchema,
});

export type CreateBookCategoryPayload = SchemaType<typeof createBookCategoryPayloadSchema>;
