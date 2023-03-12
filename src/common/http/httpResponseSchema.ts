import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';
import { ZodSchema } from '../../libs/validator/zodSchema';

export const httpResponseSchemaSchema = Schema.object({
  bodySchema: Schema.unsafeType<ZodSchema>(),
});

export type HttpResponseSchema = SchemaType<typeof httpResponseSchemaSchema>;
