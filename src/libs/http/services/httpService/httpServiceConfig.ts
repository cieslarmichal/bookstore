import { Schema } from '../../../validator/schema';
import { SchemaType } from '../../../validator/schemaType';
import { headersSchema } from '../../httpHeader';

export const httpServiceConfigSchema = Schema.object({
  baseUrl: Schema.string(),
  headers: headersSchema.optional(),
});

export type HttpServiceConfig = SchemaType<typeof httpServiceConfigSchema>;
