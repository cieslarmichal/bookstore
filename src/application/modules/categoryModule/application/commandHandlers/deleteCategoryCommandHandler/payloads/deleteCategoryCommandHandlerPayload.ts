import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteCategoryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  categoryId: Schema.string(),
});

export type DeleteCategoryCommandHandlerPayload = SchemaType<typeof deleteCategoryCommandHandlerPayloadSchema>;
