import { HttpController } from '@common/http';
import { Schema, SchemaType } from '@libs/validator';

export const registerControllerRoutesPayloadSchema = Schema.object({
  controller: Schema.unsafeType<HttpController>(),
});

export type RegisterControllerRoutesPayload = SchemaType<typeof registerControllerRoutesPayloadSchema>;
