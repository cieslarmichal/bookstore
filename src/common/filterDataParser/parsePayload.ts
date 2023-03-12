import { SchemaType } from '../../libs/validator/contracts/schemaType';
import { Schema } from '../../libs/validator/implementations/schema';
import { FilterSymbol } from '../types/contracts/filterSymbol';

export const parsePayloadSchema = Schema.object({
  jsonData: Schema.notEmptyString(),
  supportedFieldsFilters: Schema.record(Schema.notEmptyString(), Schema.array(Schema.enum(FilterSymbol))),
});

export type ParsePayload = SchemaType<typeof parsePayloadSchema>;
