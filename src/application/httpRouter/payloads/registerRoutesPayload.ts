import { HttpRoute } from '../../../common/http/httpRoute';
import { Schema } from '../../../libs/validator/schema';
import { SchemaType } from '../../../libs/validator/schemaType';

export const registerRoutesPayloadSchema = Schema.object({
  routes: Schema.array(Schema.instanceof(HttpRoute)),
  basePath: Schema.string(),
});

export type RegisterRoutesPayload = SchemaType<typeof registerRoutesPayloadSchema>;
