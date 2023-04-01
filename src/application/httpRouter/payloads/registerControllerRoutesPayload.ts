import { HttpController } from '../../../common/http/httpController';
import { Schema } from '../../../libs/validator/schema';
import { SchemaType } from '../../../libs/validator/schemaType';

export const registerControllerRoutesPayloadSchema = Schema.object({
  controller: Schema.unsafeType<HttpController>(),
});

export type RegisterControllerRoutesPayload = SchemaType<typeof registerControllerRoutesPayloadSchema>;
