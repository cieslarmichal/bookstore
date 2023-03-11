import { UnitOfWork } from '../../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../../libs/validator/implementations/schema';

export const deleteInventoryPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.notEmptyString(),
});

export type DeleteInventoryPayload = SchemaType<typeof deleteInventoryPayloadSchema>;
