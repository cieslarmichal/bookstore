import { ZodSchema, Schema, SchemaType } from '@libs/validator';

export const httpResponseSchemaSchema = Schema.object({
  bodySchema: Schema.unsafeType<ZodSchema>(),
});

export type HttpResponseSchema = SchemaType<typeof httpResponseSchemaSchema>;
