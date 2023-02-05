import { createCustomerDraftSchema } from './createCustomerDraft';
import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';

export const createCustomerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCustomerDraftSchema,
});

export type CreateCustomerPayload = SchemaType<typeof createCustomerPayloadSchema>;
