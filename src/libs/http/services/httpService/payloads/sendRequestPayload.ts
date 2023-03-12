import { HttpMethodName } from '../../../../../common/http/httpMethodName';
import { SchemaType } from '../../../../validator/schemaType';
import { Schema } from '../../../../validator/implementations/schema';

export const sendRequestPayloadSchema = Schema.object({
  endpoint: Schema.notEmptyString().optional(),
  headers: Schema.record(Schema.string(), Schema.string()).optional(),
  queryParams: Schema.record(Schema.string(), Schema.string()).optional(),
  body: Schema.any().optional(),
  method: Schema.enum(HttpMethodName),
});

export type SendRequestPayload = SchemaType<typeof sendRequestPayloadSchema>;
