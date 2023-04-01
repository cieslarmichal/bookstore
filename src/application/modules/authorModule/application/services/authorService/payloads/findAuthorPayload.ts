import { UnitOfWork } from '../../../../../../../libs/unitOfWork/unitOfWork';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const findAuthorPayloadSchema = Schema.object({
  unitOfWork: Schema.unsafeType<UnitOfWork>(),
  authorId: Schema.notEmptyString(),
});

export type FindAuthorPayload = SchemaType<typeof findAuthorPayloadSchema>;
