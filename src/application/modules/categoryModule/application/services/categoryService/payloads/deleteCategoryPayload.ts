import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCategoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  categoryId: Schema.notEmptyString(),
});

export type DeleteCategoryPayload = SchemaType<typeof deleteCategoryPayloadSchema>;