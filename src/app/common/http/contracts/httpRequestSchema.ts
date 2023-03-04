import { SchemaType } from '../../../libs/validator/contracts/schemaType';
import { ZodSchema } from '../../../libs/validator/contracts/zodSchema';
import { Schema } from '../../../libs/validator/implementations/schema';

export const httpRequestSchemaSchema = Schema.object({
  bodySchema: Schema.unsafeType<ZodSchema>().optional(),
  queryParamsSchema: Schema.unsafeType<ZodSchema>().optional(),
});

export type HttpRequestSchema = SchemaType<typeof httpRequestSchemaSchema>;
