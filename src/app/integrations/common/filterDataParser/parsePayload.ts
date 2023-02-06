import { FilterSymbol } from '../../../common/types/contracts/filterSymbol';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';

export const parsePayloadSchema = Schema.object({
  jsonData: Schema.notEmptyString(),
  supportedFieldsFilters: Schema.record(Schema.notEmptyString(), Schema.array(Schema.enum(FilterSymbol))),
});

export type ParsePayload = SchemaType<typeof parsePayloadSchema>;
