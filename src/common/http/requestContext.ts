import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';

export const requestContextSchema = Schema.object({
  userId: Schema.string().optional(),
});

export type RequestContext = SchemaType<typeof requestContextSchema>;
