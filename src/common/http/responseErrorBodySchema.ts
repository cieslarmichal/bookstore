import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';

export const responseErrorBodySchema = Schema.object({
  error: Schema.object({
    name: Schema.string(),
    message: Schema.string(),
    context: Schema.record(Schema.string(), Schema.any()).optional(),
  }),
});

export type ResponseErrorBody = SchemaType<typeof responseErrorBodySchema>;
