import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const deleteInventoryCommandHandlerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  inventoryId: Schema.string(),
});

export type DeleteInventoryCommandHandlerPayload = SchemaType<typeof deleteInventoryCommandHandlerPayloadSchema>;
