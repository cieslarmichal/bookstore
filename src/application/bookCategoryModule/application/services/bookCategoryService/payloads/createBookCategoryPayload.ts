import { createBookCategoryDraftSchema } from './createBookCategoryDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const createBookCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createBookCategoryDraftSchema,
});

export type CreateBookCategoryPayload = SchemaType<typeof createBookCategoryPayloadSchema>;
