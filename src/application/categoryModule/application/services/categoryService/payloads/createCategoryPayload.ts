import { createCategoryDraftSchema } from './createCategoryDraft';
import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';

import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Schema } from '../../../../../../libs/validator/schema';

export const createCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCategoryDraftSchema,
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
