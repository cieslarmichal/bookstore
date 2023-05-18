import { createCategoryDraftSchema } from './createCategoryDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCategoryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCategoryDraftSchema,
});

export type CreateCategoryCommandHandlerPayload = SchemaType<typeof createCategoryCommandHandlerPayloadSchema>;
