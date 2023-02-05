import { createCategoryDraftSchema } from './createCategoryDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCategoryDraftSchema,
});

export type CreateCategoryPayload = SchemaType<typeof createCategoryPayloadSchema>;
