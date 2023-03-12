import { HttpRoute } from '@common/http';
import { Schema, SchemaType } from '@libs/validator';

export const registerRoutesPayloadSchema = Schema.object({
  routes: Schema.array(Schema.instanceof(HttpRoute)),
  basePath: Schema.string(),
});

export type RegisterRoutesPayload = SchemaType<typeof registerRoutesPayloadSchema>;
