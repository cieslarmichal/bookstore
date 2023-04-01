import { HttpController } from '../../common/http/httpController.js';
import { Schema } from '../../libs/validator/schema.js';
import { SchemaType } from '../../libs/validator/schemaType.js';

export const registerControllerRoutesPayloadSchema = Schema.object({
  controller: Schema.unsafeType<HttpController>(),
});

export type RegisterControllerRoutesPayload = SchemaType<typeof registerControllerRoutesPayloadSchema>;
