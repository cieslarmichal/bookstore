import { createBookCategoryDraftSchema } from './createBookCategoryDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createBookCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createBookCategoryDraftSchema,
});

export type CreateBookCategoryPayload = SchemaType<typeof createBookCategoryPayloadSchema>;
