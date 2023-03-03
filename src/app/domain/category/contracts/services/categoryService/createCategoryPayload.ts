import { createCategoryDraftSchema } from './createCategoryDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCategoryDraftSchema,
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
