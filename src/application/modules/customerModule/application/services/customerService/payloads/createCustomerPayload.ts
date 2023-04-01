import { createCustomerDraftSchema } from './createCustomerDraft';
import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCustomerPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  draft: createCustomerDraftSchema,
});

export type CreateCustomerPayload = SchemaType<typeof createCustomerPayloadSchema>;
