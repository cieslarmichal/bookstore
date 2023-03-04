import { Schema, SchemaType, Validator } from '@libs/validator';

import { HttpMethodName } from './httpMethodName.js';
import { httpRequestSchema } from './httpRequest.js';
import { HttpRequestSchema, httpRequestSchemaSchema } from './httpRequestSchema.js';
import { httpResponseSchema } from './httpResponse.js';
import { HttpResponseSchema, httpResponseSchemaSchema } from './httpResponseSchema.js';
import { HttpRouteHandler } from './httpRouteHandler.js';

const payloadSchema = Schema.object({
  method: Schema.enum(HttpMethodName),
  path: Schema.string().optional(),
  handler: Schema.function(Schema.tuple([httpRequestSchema]), Schema.promise(httpResponseSchema)),
  requestSchema: httpRequestSchemaSchema.optional(),
  responseSchema: httpResponseSchemaSchema.optional(),
});

export type HttpRouteInput = SchemaType<typeof payloadSchema>;

export class HttpRoute {
  public readonly method: HttpMethodName;
  public readonly path: string;
  public readonly handler: HttpRouteHandler;
  public readonly requestSchema?: HttpRequestSchema;
  public readonly responseSchema?: HttpResponseSchema;

  public constructor(input: HttpRouteInput) {
    const { method, path, handler, requestSchema, responseSchema } = Validator.validate(payloadSchema, input);

    this.method = method;
    this.path = path ?? '';
    this.handler = handler;

    if (requestSchema) {
      this.requestSchema = requestSchema;
    }

    if (responseSchema) {
      this.responseSchema = responseSchema;
    }
  }
}
