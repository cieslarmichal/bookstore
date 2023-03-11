import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const findInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.notEmptyString().optional(),
  bookId: Schema.notEmptyString().optional(),
});

export type FindInventoryPayload = SchemaType<typeof findInventoryPayloadSchema>;
