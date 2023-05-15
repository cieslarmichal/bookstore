import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteBookCategoryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  bookId: Schema.string(),
  categoryId: Schema.string(),
});

export type DeleteBookCategoryCommandHandlerPayload = SchemaType<typeof deleteBookCategoryCommandHandlerPayloadSchema>;
