import { HttpMethodName } from './httpMethodName';
import { httpRequestSchema } from './httpRequest';
import { HttpRequestSchema, httpRequestSchemaSchema } from './httpRequestSchema';
import { httpResponseSchema } from './httpResponse';
import { HttpResponseSchema, httpResponseSchemaSchema } from './httpResponseSchema';
import { HttpRouteHandler } from './httpRouteHandler';
import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';
import { Validator } from '../../libs/validator/validator';

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
