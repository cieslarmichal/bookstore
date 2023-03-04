import { Schema, SchemaType } from '@libs/validator';

import { HttpStatusCode } from './httpStatusCode.js';

export const httpResponseSchema = Schema.object({
  statusCode: Schema.enum(HttpStatusCode),
  body: Schema.unknown().optional(),
});

export type HttpResponse = SchemaType<typeof httpResponseSchema>;
