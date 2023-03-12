import { SchemaType } from '../../../validator/schemaType';
import { Schema } from '../../../validator/implementations/schema';
import { headersSchema } from '../../httpHeader';

export const httpServiceConfigSchema = Schema.object({
  baseUrl: Schema.notEmptyString(),
  headers: headersSchema.optional(),
});

export type HttpServiceConfig = SchemaType<typeof httpServiceConfigSchema>;
