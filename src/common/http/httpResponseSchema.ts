import { SchemaType } from '../../libs/validator/schemaType';
import { ZodSchema } from '../../libs/validator/contracts/zodSchema';
import { Schema } from '../../libs/validator/implementations/schema';

export const httpResponseSchemaSchema = Schema.object({
  bodySchema: Schema.unsafeType<ZodSchema>(),
});

export type HttpResponseSchema = SchemaType<typeof httpResponseSchemaSchema>;
