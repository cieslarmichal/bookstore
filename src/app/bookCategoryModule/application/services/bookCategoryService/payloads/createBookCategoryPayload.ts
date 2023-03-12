import { createBookCategoryDraftSchema } from './createBookCategoryDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { Schema } from '../../../../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createBookCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createBookCategoryDraftSchema,
});

export type CreateBookCategoryPayload = SchemaType<typeof createBookCategoryPayloadSchema>;
