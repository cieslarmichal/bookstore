import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const findInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.notEmptyString().optional(),
  bookId: Schema.notEmptyString().optional(),
});

export type FindInventoryPayload = SchemaType<typeof findInventoryPayloadSchema>;
