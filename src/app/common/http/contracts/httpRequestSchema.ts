import { ZodSchema, Schema, SchemaType } from '@libs/validator';

export const httpRequestSchemaSchema = Schema.object({
  bodySchema: Schema.unsafeType<ZodSchema>().optional(),
  queryParamsSchema: Schema.unsafeType<ZodSchema>().optional(),
});

export type HttpRequestSchema = SchemaType<typeof httpRequestSchemaSchema>;
