import { HttpMethodName } from '../../../../../common/http/httpMethodName';
import { Schema } from '../../../../validator/schema';
import { SchemaType } from '../../../../validator/schemaType';
export const sendRequestPayloadSchema = Schema.object({
  endpoint: Schema.notEmptyString().optional(),
  headers: Schema.record(Schema.string(), Schema.string()).optional(),
  queryParams: Schema.record(Schema.string(), Schema.string()).optional(),
  body: Schema.any().optional(),
  method: Schema.enum(HttpMethodName),
});

export type SendRequestPayload = SchemaType<typeof sendRequestPayloadSchema>;
