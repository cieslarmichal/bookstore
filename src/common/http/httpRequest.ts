import { SchemaType } from '../../libs/validator/contracts/schemaType';
import { Schema } from '../../libs/validator/implementations/schema';

export const httpRequestSchema = Schema.object({
  body: Schema.any(),
  pathParams: Schema.record(Schema.string(), Schema.string()),
  queryParams: Schema.record(Schema.string(), Schema.string()),
});

export type HttpRequest = SchemaType<typeof httpRequestSchema>;
