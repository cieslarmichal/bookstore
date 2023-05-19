import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findInventoryQueryHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.string().optional(),
  bookId: Schema.string().optional(),
});

export type FindInventoryQueryHandlerPayload = SchemaType<typeof findInventoryQueryHandlerPayloadSchema>;
