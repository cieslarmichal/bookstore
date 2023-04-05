import { Schema } from '../../../libs/validator/schema';
import { SchemaType } from '../../../libs/validator/schemaType';
import { FilterSymbol } from '../../types/filterSymbol';

export const parsePayloadSchema = Schema.object({
  jsonData: Schema.string(),
  supportedFieldsFilters: Schema.record(Schema.string(), Schema.array(Schema.enum(FilterSymbol))),
});

export type ParsePayload = SchemaType<typeof parsePayloadSchema>;
