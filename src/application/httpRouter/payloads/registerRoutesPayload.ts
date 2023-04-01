import { HttpRoute } from '../../common/http/httpRoute.js';
import { Schema } from '../../libs/validator/schema.js';
import { SchemaType } from '../../libs/validator/schemaType.js';

export const registerRoutesPayloadSchema = Schema.object({
  routes: Schema.array(Schema.instanceof(HttpRoute)),
  basePath: Schema.string(),
});

export type RegisterRoutesPayload = SchemaType<typeof registerRoutesPayloadSchema>;
