import { createCustomerDraftSchema } from './createCustomerDraft';
import { UnitOfWork } from '../../../../../libs/unitOfWork/contracts/unitOfWork';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';

export const createCustomerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCustomerDraftSchema,
});

export type CreateCustomerPayload = SchemaType<typeof createCustomerPayloadSchema>;
