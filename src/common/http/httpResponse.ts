import { HttpStatusCode } from './httpStatusCode';
import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';

export const httpResponseSchema = Schema.object({
  statusCode: Schema.enum(HttpStatusCode),
  body: Schema.unknown().optional(),
});

export type HttpResponse = SchemaType<typeof httpResponseSchema>;
