import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';

export const httpRequestSchema = Schema.object({
  body: Schema.any(),
  pathParams: Schema.record(Schema.string(), Schema.string()),
  queryParams: Schema.record(Schema.string(), Schema.string()),
});

export type HttpRequest = SchemaType<typeof httpRequestSchema>;
