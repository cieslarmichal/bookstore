import { HttpStatusCode } from './httpStatusCode';
import { SchemaType } from '../../libs/validator/schemaType';
import { Schema } from '../../libs/validator/implementations/schema';

export const httpResponseSchema = Schema.object({
  statusCode: Schema.enum(HttpStatusCode),
  body: Schema.unknown().optional(),
});

export type HttpResponse = SchemaType<typeof httpResponseSchema>;
