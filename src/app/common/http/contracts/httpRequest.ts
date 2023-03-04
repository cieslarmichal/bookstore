import { Schema, SchemaType } from '@libs/validator';

export const httpRequestSchema = Schema.object({
  body: Schema.any(),
  pathParams: Schema.record(Schema.string(), Schema.string()),
  queryParams: Schema.record(Schema.string(), Schema.string()),
});

export type HttpRequest = SchemaType<typeof httpRequestSchema>;
