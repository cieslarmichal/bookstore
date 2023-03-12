import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';
import { ZodSchema } from '../../libs/validator/zodSchema';

export const httpRequestSchemaSchema = Schema.object({
  bodySchema: Schema.unsafeType<ZodSchema>().optional(),
  queryParamsSchema: Schema.unsafeType<ZodSchema>().optional(),
});

export type HttpRequestSchema = SchemaType<typeof httpRequestSchemaSchema>;
