import { UnitOfWork } from '../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';

export const findInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.notEmptyString().optional(),
  bookId: Schema.notEmptyString().optional(),
});

export type FindInventoryPayload = SchemaType<typeof findInventoryPayloadSchema>;
