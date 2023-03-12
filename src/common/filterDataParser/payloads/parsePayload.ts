import { Schema } from '../../../libs/validator/implementations/schema';
import { SchemaType } from '../../../libs/validator/schemaType';
import { FilterSymbol } from '../../types/filterSymbol';

export const parsePayloadSchema = Schema.object({
  jsonData: Schema.notEmptyString(),
  supportedFieldsFilters: Schema.record(Schema.notEmptyString(), Schema.array(Schema.enum(FilterSymbol))),
});

export type ParsePayload = SchemaType<typeof parsePayloadSchema>;
